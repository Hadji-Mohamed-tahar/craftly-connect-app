import React, { createContext, useContext, useEffect, useState } from 'react';
import { CrafterData } from '../lib/userDataStructure';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface Proposal {
  id: string;
  requestId: string;
  crafterId: string;
  crafterName: string;
  crafterSpecialty: string;
  crafterRating: number;
  price: number;
  duration: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'frozen';
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  images?: string[];
  clientId: string;
  clientName: string;
  status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
  acceptedProposalId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'proposal_received' | 'proposal_accepted' | 'proposal_rejected' | 'request_closed' | 'order_started' | 'order_completed';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // requestId or proposalId
}

interface ProposalContextType {
  proposals: Proposal[];
  requests: ServiceRequest[];
  notifications: Notification[];
  loading: boolean;
  createRequest: (requestData: Omit<ServiceRequest, 'id' | 'clientId' | 'clientName' | 'createdAt' | 'status'>) => Promise<string>;
  createProposal: (proposalData: Omit<Proposal, 'id' | 'crafterId' | 'crafterName' | 'crafterSpecialty' | 'crafterRating' | 'createdAt' | 'status'>) => Promise<string>;
  updateProposal: (proposalId: string, data: Partial<Proposal>) => Promise<void>;
  acceptProposal: (proposalId: string, requestId: string) => Promise<void>;
  rejectProposal: (proposalId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  getUnreadNotificationsCount: () => number;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useProposals must be used within a ProposalProvider');
  }
  return context;
};

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to requests
  useEffect(() => {
    if (!currentUser || !userProfile) {
      setRequests([]);
      return;
    }

    const requestsRef = collection(db, 'requests');
    let requestsQuery;

    if (userProfile.userType === 'client') {
      // Clients see only their own requests
      requestsQuery = query(
        requestsRef,
        where('clientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Crafters see all open requests
      requestsQuery = query(
        requestsRef,
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(requestsQuery, 
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ServiceRequest));
        setRequests(requestsData);
      },
      (error) => {
        console.error('Error listening to requests:', error);
        setRequests([]);
      }
    );

    return unsubscribe;
  }, [currentUser, userProfile]);

  // Listen to proposals
  useEffect(() => {
    if (!currentUser || !userProfile) {
      setProposals([]);
      return;
    }

    const proposalsRef = collection(db, 'proposals');
    let proposalsQuery;

    if (userProfile.userType === 'client') {
      // Clients see proposals for their requests
      proposalsQuery = query(
        proposalsRef,
        orderBy('createdAt', 'desc')
      );
    } else {
      // Crafters see only their own proposals
      proposalsQuery = query(
        proposalsRef,
        where('crafterId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(proposalsQuery, 
      (snapshot) => {
        let proposalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Proposal));

        // Filter for clients - only proposals for their requests
        if (userProfile.userType === 'client') {
          const clientRequestIds = requests.map(r => r.id);
          proposalsData = proposalsData.filter(p => clientRequestIds.includes(p.requestId));
        }

        setProposals(proposalsData);
      },
      (error) => {
        console.error('Error listening to proposals:', error);
        setProposals([]);
      }
    );

    return unsubscribe;
  }, [currentUser, userProfile, requests]);

  // Listen to notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, 
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        setNotifications(notificationsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to notifications:', error);
        setNotifications([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const createRequest = async (requestData: Omit<ServiceRequest, 'id' | 'clientId' | 'clientName' | 'createdAt' | 'status'>) => {
    if (!currentUser || !userProfile) throw new Error('User not authenticated');

    const newRequest = {
      ...requestData,
      clientId: currentUser.uid,
      clientName: userProfile.name,
      status: 'open' as const,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'requests'), newRequest);
      return docRef.id;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'crafterId' | 'crafterName' | 'crafterSpecialty' | 'crafterRating' | 'createdAt' | 'status'>) => {
    if (!currentUser || !userProfile) throw new Error('User not authenticated');

    const newProposal = {
      ...proposalData,
      crafterId: currentUser.uid,
      crafterName: userProfile.name,
      // إضافة معلومات الحرفي إذا كان من نوع حرفي
      crafterSpecialty: userProfile.userType === 'crafter' ? (userProfile as CrafterData).specialty || 'حرفي' : 'حرفي',
      crafterRating: userProfile.userType === 'crafter' ? (userProfile as CrafterData).rating || 0 : 0,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'proposals'), newProposal);
      
      // Send notification to client
      const request = requests.find(r => r.id === proposalData.requestId);
      if (request) {
        await addDoc(collection(db, 'notifications'), {
          userId: request.clientId,
          type: 'proposal_received',
          title: 'عرض جديد',
          message: `تلقيت عرضاً جديداً من ${userProfile.name} لطلبك "${request.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedId: docRef.id
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  const updateProposal = async (proposalId: string, data: Partial<Proposal>) => {
    try {
      await updateDoc(doc(db, 'proposals', proposalId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  };

  const acceptProposal = async (proposalId: string, requestId: string) => {
    if (!currentUser || !userProfile) throw new Error('User not authenticated');

    try {
      // Accept the proposal
      await updateDoc(doc(db, 'proposals', proposalId), {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      // Freeze all other proposals for this request
      const otherProposalsQuery = query(
        collection(db, 'proposals'),
        where('requestId', '==', requestId)
      );
      const snapshot = await getDocs(otherProposalsQuery);
      
      const updatePromises = snapshot.docs.map(doc => {
        if (doc.id !== proposalId) {
          return updateDoc(doc.ref, {
            status: 'frozen',
            updatedAt: new Date().toISOString()
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Close the request
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'closed',
        acceptedProposalId: proposalId
      });

      // Send notification to accepted crafter
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        await addDoc(collection(db, 'notifications'), {
          userId: proposal.crafterId,
          type: 'proposal_accepted',
          title: 'تم قبول عرضك',
          message: `تم قبول عرضك للطلب وأصبح العمل قيد التنفيذ`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedId: proposalId
        });

        // Send notifications to other crafters
        const otherProposals = proposals.filter(p => p.requestId === requestId && p.id !== proposalId);
        const notificationPromises = otherProposals.map(p => 
          addDoc(collection(db, 'notifications'), {
            userId: p.crafterId,
            type: 'request_closed',
            title: 'تم إغلاق الطلب',
            message: `تم اختيار حرفي آخر للطلب`,
            read: false,
            createdAt: new Date().toISOString(),
            relatedId: requestId
          })
        );

        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      throw error;
    }
  };

  const rejectProposal = async (proposalId: string) => {
    try {
      await updateDoc(doc(db, 'proposals', proposalId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });

      // Send notification to crafter
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        await addDoc(collection(db, 'notifications'), {
          userId: proposal.crafterId,
          type: 'proposal_rejected',
          title: 'تم رفض العرض',
          message: `تم رفض عرضك للطلب`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedId: proposalId
        });
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      throw error;
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'cancelled'
      });

      // Delete all related proposals
      const proposalsQuery = query(
        collection(db, 'proposals'),
        where('requestId', '==', requestId)
      );
      const snapshot = await getDocs(proposalsQuery);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cancelling request:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value: ProposalContextType = {
    proposals,
    requests,
    notifications,
    loading,
    createRequest,
    createProposal,
    updateProposal,
    acceptProposal,
    rejectProposal,
    cancelRequest,
    markNotificationAsRead,
    getUnreadNotificationsCount
  };

  return (
    <ProposalContext.Provider value={value}>
      {children}
    </ProposalContext.Provider>
  );
};