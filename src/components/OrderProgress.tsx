import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, Play, Flag, Star } from 'lucide-react';

export type OrderProgressStatus = 'pending' | 'open' | 'closed' | 'in_progress' | 'completed' | 'rated' | 'cancelled';

interface OrderProgressProps {
  status: OrderProgressStatus;
  title?: string;
  showDetails?: boolean;
}

const OrderProgress: React.FC<OrderProgressProps> = ({ 
  status, 
  title = "حالة الطلب",
  showDetails = true 
}) => {
  const getProgressValue = () => {
    switch (status) {
      case 'pending':
        return 10;
      case 'open':
        return 25;
      case 'closed':
        return 45;
      case 'in_progress':
        return 65;
      case 'completed':
        return 85;
      case 'rated':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'في انتظار الموافقة',
          description: 'تم إرسال الطلب وهو في انتظار موافقة الإدارة',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'open':
        return {
          label: 'متاح للحرفيين',
          description: 'وافقت الإدارة على الطلب وأصبح متاحاً لاستقبال عروض الحرفيين',
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      case 'closed':
        return {
          label: 'تم اختيار حرفي',
          description: 'تم قبول أحد العروض واختيار الحرفي المناسب',
          color: 'bg-indigo-100 text-indigo-800',
          icon: CheckCircle
        };
      case 'in_progress':
        return {
          label: 'قيد التنفيذ',
          description: 'بدأ الحرفي في تنفيذ العمل المطلوب',
          color: 'bg-purple-100 text-purple-800',
          icon: Play
        };
      case 'completed':
        return {
          label: 'مكتمل',
          description: 'أنهى الحرفي العمل وفي انتظار تقييمك',
          color: 'bg-green-100 text-green-800',
          icon: Flag
        };
      case 'rated':
        return {
          label: 'تم التقييم',
          description: 'تم إكمال الطلب وتقييم الحرفي بنجاح',
          color: 'bg-emerald-100 text-emerald-800',
          icon: Star
        };
      case 'cancelled':
        return {
          label: 'ملغي',
          description: 'تم إلغاء الطلب',
          color: 'bg-red-100 text-red-800',
          icon: Clock
        };
      default:
        return {
          label: 'غير محدد',
          description: '',
          color: 'bg-gray-100 text-gray-800',
          icon: Clock
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const steps = [
    { key: 'pending', label: 'في انتظار الموافقة', completed: ['open', 'closed', 'in_progress', 'completed', 'rated'].includes(status) },
    { key: 'open', label: 'متاح للحرفيين', completed: ['closed', 'in_progress', 'completed', 'rated'].includes(status) },
    { key: 'closed', label: 'تم اختيار حرفي', completed: ['in_progress', 'completed', 'rated'].includes(status) },
    { key: 'in_progress', label: 'قيد التنفيذ', completed: ['completed', 'rated'].includes(status) },
    { key: 'completed', label: 'مكتمل', completed: ['rated'].includes(status) },
    { key: 'rated', label: 'تم التقييم', completed: status === 'rated' }
  ];

  if (status === 'cancelled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            {showDetails && (
              <p className="text-sm text-gray-600 mt-2">{statusInfo.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-gray-500">
              {getProgressValue()}%
            </span>
          </div>
          <Progress 
            value={getProgressValue()} 
            className="h-2"
          />
        </div>

        {/* Status Description */}
        {showDetails && (
          <p className="text-sm text-gray-600">{statusInfo.description}</p>
        )}

        {/* Steps Timeline */}
        {showDetails && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">مراحل الطلب:</h4>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.key === status 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed 
                      ? 'text-green-600 font-medium' 
                      : step.key === status 
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderProgress;