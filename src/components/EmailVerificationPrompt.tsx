import { useState } from 'react';
import { Mail, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/firebase/auth';
import { toast } from 'sonner';

interface EmailVerificationPromptProps {
  email: string;
}

const EmailVerificationPrompt = ({ email }: EmailVerificationPromptProps) => {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    const result = await authService.resendVerificationEmail();
    if (result.success) {
      toast.success('Verification email sent! Check your inbox.');
    } else {
      toast.error(result.error || 'Failed to send verification email.');
    }
    setIsResending(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="bg-orange-50 p-8 rounded-2xl border border-orange-200 shadow-sm flex flex-col items-center w-full">
        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
        <p className="text-slate-600 mb-8">
          Please verify your email address <strong>{email}</strong> to access this page. 
          Check your inbox (and spam folder) for the verification link.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleResend}
            disabled={isResending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isResending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Resend Email
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            I've verified it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;
