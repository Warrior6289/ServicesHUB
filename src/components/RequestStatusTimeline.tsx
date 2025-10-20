import React from 'react';
import { motion } from 'framer-motion';
import type { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';

type RequestStatusTimelineProps = {
  request: ServiceRequest;
};

type TimelineStep = {
  status: ServiceRequestStatus;
  label: string;
  timestamp?: string;
  active: boolean;
  completed: boolean;
};

const statusOrder: ServiceRequestStatus[] = [
  'pending',
  'accepted',
  'in_progress',
  'completed',
];

export const RequestStatusTimeline: React.FC<RequestStatusTimelineProps> = ({ request }) => {
  const getSteps = (): TimelineStep[] => {
    const currentStatusIndex = statusOrder.indexOf(request.status);
    
    return statusOrder.map((status, index) => {
      let timestamp: string | undefined;
      
      if (status === 'pending' && request.createdAt) {
        timestamp = request.createdAt;
      } else if (status === 'accepted' && request.acceptedAt) {
        timestamp = request.acceptedAt;
      }
      
      return {
        status,
        label: getStatusLabel(status),
        timestamp,
        active: status === request.status,
        completed: index < currentStatusIndex,
      };
    });
  };

  const steps = getSteps();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSpecialStatus = ['price_boosted', 'converted_to_scheduled', 'cancelled', 'expired'].includes(request.status);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Request Status
      </h3>

      {/* Special Status Alert */}
      {isSpecialStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            request.status === 'price_boosted'
              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              : request.status === 'converted_to_scheduled'
              ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800'
              : request.status === 'cancelled'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'
          }`}
        >
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">
                {request.status === 'price_boosted' && 'Price was boosted'}
                {request.status === 'converted_to_scheduled' && 'Converted to scheduled request'}
                {request.status === 'cancelled' && 'Request was cancelled'}
                {request.status === 'expired' && 'Request expired'}
              </p>
              <p className="text-sm opacity-75 mt-1">
                {request.status === 'price_boosted' && `Price increased to $${request.currentPrice.toFixed(2)}`}
                {request.status === 'converted_to_scheduled' && 'No instant service providers accepted. You can now manually schedule.'}
                {request.status === 'cancelled' && 'This request has been cancelled and is no longer active.'}
                {request.status === 'expired' && 'This instant request expired without being accepted.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {!['cancelled', 'expired'].includes(request.status) && (
        <div className="relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={step.status} className="relative pb-8 last:pb-0">
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                    {step.completed && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        className="bg-primary-600 w-full"
                      />
                    )}
                  </div>
                )}

                {/* Step */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? 'bg-primary-600 border-primary-600'
                          : step.active
                          ? 'bg-white dark:bg-slate-800 border-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {step.completed ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step.active ? (
                        <div className="w-3 h-3 rounded-full bg-primary-600 animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`font-medium ${
                        step.active || step.completed
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                      {step.active && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          Current
                        </span>
                      )}
                    </p>
                    {step.timestamp && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimestamp(step.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price History */}
      {request.priceHistory.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Price History
          </h4>
          <div className="space-y-2">
            {request.priceHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${entry.price.toFixed(2)}
                  {index > 0 && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                      +{((entry.price / request.priceHistory[0].price - 1) * 100).toFixed(0)}%
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getStatusLabel(status: ServiceRequestStatus): string {
  const labels: Record<ServiceRequestStatus, string> = {
    pending: 'Request Submitted',
    price_boosted: 'Price Boosted',
    converted_to_scheduled: 'Converted to Scheduled',
    accepted: 'Provider Accepted',
    in_progress: 'Service in Progress',
    completed: 'Service Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };
  return labels[status];
}

