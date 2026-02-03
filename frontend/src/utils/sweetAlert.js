import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Inject Custom Styles for that "Unique" Look
const style = document.createElement('style');
style.innerHTML = `
  /* Toast Animations */
  .colored-toast.swal2-icon-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4) !important;
  }
  .colored-toast.swal2-icon-error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4) !important;
  }
  .colored-toast .swal2-title {
    color: white !important;
    font-weight: 700 !important;
  }
  .colored-toast .swal2-close {
    color: white !important;
  }
  .colored-toast .swal2-html-container {
    color: rgba(255,255,255,0.9) !important;
  }
  
  /* Popup Animations */
  .animate-popup {
    animation: spring-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  @keyframes spring-in {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Custom Icon Pulse */
  .swal2-icon.swal2-warning {
    border-color: #f59e0b !important;
    color: #f59e0b !important;
  }
  .swal2-icon.swal2-question {
    border-color: #6366f1 !important;
    color: #6366f1 !important;
  }
`;
document.head.appendChild(style);

/**
 * Modern Confirmation Alert
 */
export const showConfirmAlert = async (title, text, confirmButtonText = 'Yes, Proceed') => {
    return MySwal.fire({
        title: title,
        html: `<p class="text-slate-500 font-medium mt-2 leading-relaxed">${text}</p>`,
        icon: 'warning', // Use default animated warning icon
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'No, Cancel',
        padding: '2em',
        background: '#fff',
        backdrop: `
            rgba(15, 23, 42, 0.6)
            backdrop-filter: blur(8px)
        `,
        customClass: {
            popup: 'rounded-3xl shadow-2xl animate-popup',
            title: 'text-2xl font-black text-slate-800 tracking-tight',
            confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl px-8 py-3.5 shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all text-sm',
            cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-6 py-3.5 transition-all text-sm ml-3 hover:scale-105',
            actions: 'gap-3'
        },
        buttonsStyling: false,
        reverseButtons: true,
        focusConfirm: false,
    }).then((result) => {
        return result.isConfirmed;
    });
};

/**
 * Modern Success Toast
 */
export const showSuccessAlert = (title, text) => {
    return MySwal.fire({
        icon: 'success',
        title: title,
        text: text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: 'colored-toast rounded-xl pt-3 pb-3 pl-4 pr-4 mt-4 mr-4',
            timerProgressBar: 'bg-white/30'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
};

/**
 * Modern Error Alert
 */
export const showErrorAlert = (title, text) => {
    return MySwal.fire({
        icon: 'error',
        title: title,
        text: text,
        padding: '2em',
        confirmButtonText: 'Understood',
        backdrop: `
            rgba(15, 23, 42, 0.6)
            backdrop-filter: blur(8px)
        `,
        customClass: {
            popup: 'rounded-3xl shadow-2xl animate-popup',
            title: 'text-2xl font-black text-slate-800 tracking-tight',
            htmlContainer: 'text-slate-500 font-medium',
            confirmButton: 'bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl px-8 py-3.5 shadow-lg transform hover:scale-105 transition-all text-sm'
        },
        buttonsStyling: false
    });
};
