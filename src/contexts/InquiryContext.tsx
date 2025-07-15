
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, updateDoc, onSnapshot, query, orderBy, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface Inquiry {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
  image?: string;
  category: 'general' | 'craftsmen';
  isMyPost: boolean;
}

export interface Comment {
  id: string;
  inquiryId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  replies: Comment[];
}

interface InquiryContextType {
  inquiries: Inquiry[];
  comments: Comment[];
  currentFilter: string;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'timestamp' | 'likes' | 'comments' | 'isLiked'>) => void;
  toggleLike: (id: string) => void;
  addComment: (inquiryId: string, content: string) => void;
  setCurrentFilter: (filter: string) => void;
  getFilteredInquiries: () => Inquiry[];
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};

export const InquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to inquiries from Firebase
  useEffect(() => {
    const inquiriesRef = collection(db, 'inquiries');
    const inquiriesQuery = query(inquiriesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(inquiriesQuery, 
      (snapshot) => {
        const inquiriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isMyPost: doc.data().authorId === currentUser?.uid
        } as Inquiry));
        setInquiries(inquiriesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to inquiries:', error);
        // Set fallback inquiries on permission error
        const fallbackInquiries: Inquiry[] = [
          {
            id: '1',
            title: 'أحتاج نجار ماهر لتصليح خزانة',
            description: 'السلام عليكم، أحتاج إلى نجار محترف لإصلاح خزانة خشبية في غرفة النوم.',
            author: {
              name: 'أحمد محمد',
              avatar: '👨‍💼'
            },
            likes: 12,
            comments: 5,
            isLiked: false,
            timestamp: '2024-01-15T10:30:00Z',
            category: 'general',
            isMyPost: false
          }
        ];
        setInquiries(fallbackInquiries);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const [comments, setComments] = useState<Comment[]>([]);

  const [currentFilter, setCurrentFilter] = useState('الأحدث');

  const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'timestamp' | 'likes' | 'comments' | 'isLiked'>) => {
    if (!currentUser || !userProfile) return;

    const newInquiry = {
      ...inquiry,
      authorId: currentUser.uid,
      author: {
        name: userProfile.name,
        avatar: '👤'
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    try {
      await addDoc(collection(db, 'inquiries'), newInquiry);
    } catch (error) {
      console.error('Error adding inquiry:', error);
      // Add to local state on permission error
      setInquiries(prev => [{ ...newInquiry, id: Date.now().toString(), isMyPost: true }, ...prev]);
    }
  };

  const toggleLike = async (id: string) => {
    if (!currentUser) return;

    const inquiry = inquiries.find(inq => inq.id === id);
    if (!inquiry) return;

    const newIsLiked = !inquiry.isLiked;
    const newLikes = newIsLiked ? inquiry.likes + 1 : inquiry.likes - 1;

    try {
      await updateDoc(doc(db, 'inquiries', id), {
        likes: newLikes,
        [`likedBy.${currentUser.uid}`]: newIsLiked
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      // Update local state on permission error
      setInquiries(prev => prev.map(inq => 
        inq.id === id 
          ? { ...inq, isLiked: newIsLiked, likes: newLikes }
          : inq
      ));
    }
  };

  const addComment = async (inquiryId: string, content: string) => {
    if (!currentUser || !userProfile) return;

    const newComment = {
      inquiryId,
      authorId: currentUser.uid,
      author: {
        name: userProfile.name,
        avatar: '👤'
      },
      content,
      timestamp: new Date().toISOString(),
      replies: []
    };

    try {
      await addDoc(collection(db, 'comments'), newComment);
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        comments: increment(1)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      // Update local state on permission error
      const commentWithId = { ...newComment, id: Date.now().toString() };
      setComments(prev => [...prev, commentWithId]);
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, comments: inquiry.comments + 1 }
          : inquiry
      ));
    }
  };

  const getFilteredInquiries = () => {
    let filtered = [...inquiries];
    
    switch (currentFilter) {
      case 'الأحدث':
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'الأكثر تفاعلاً':
        return filtered.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
      case 'الحرفيون فقط':
        return filtered.filter(inquiry => inquiry.category === 'craftsmen');
      case 'منشوراتي':
        return filtered.filter(inquiry => inquiry.isMyPost);
      default:
        return filtered;
    }
  };

  return (
    <InquiryContext.Provider value={{
      inquiries,
      comments,
      currentFilter,
      addInquiry,
      toggleLike,
      addComment,
      setCurrentFilter,
      getFilteredInquiries
    }}>
      {children}
    </InquiryContext.Provider>
  );
};
