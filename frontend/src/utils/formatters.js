/**
 * Formatting utilities
 */

export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'DELIVERED':
    case 'ACTIVE':
    case 'PAID':
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'PACKED':
    case 'CONFIRMED':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    case 'PLACED':
    case 'PENDING':
    case 'NEW':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'CANCELLED':
    case 'REJECTED':
    case 'BLOCKED':
    case 'OUT_OF_STOCK':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'RETURNED':
    case 'RETURN_REQUESTED':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
};
