import { Formik, Form } from 'formik';
import { Lock, LogIn, XCircle, CheckCircle2 } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import { InputField } from '../components/InputField';
import { PasswordStrengthField } from '../components/PasswordStrengthField';

export default function Login({ togglePage }) {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-highlight" />
      
      <div className="auth-card-floating">
        <div className="flex flex-col items-center mb-10 text-center">
          {/* Main Logo Container */}
          <div className="bg-[#0f172a] p-4 rounded-3xl mb-6 text-white shadow-xl shadow-slate-900/20 transition-transform hover:scale-105 duration-300">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight mb-2 uppercase">Log In</h1>
          <p className="text-slate-500 text-[15px] font-medium">Sign in to continue to your account</p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          validateOnChange={true} // Enables live UI updates as you type
          onSubmit={(values) => console.log("Login Data:", values)}
        >
          {({ errors, values }) => (
            <Form>
              {/* Email Section with Live Feedback */}
              <div className="mb-6">
                <InputField 
                  label="Email Address" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com" 
                />
              
                {!errors.email && values.email.length > 0 && (
                  <p className="text-green-600 text-[11px] mt-1 ml-4 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Valid email format
                  </p>
                )}
              </div>
              
              {/* Using your custom PasswordStrengthField */}
              <div className="relative">
                <PasswordStrengthField 
                  label="Password" 
                  name="password" 
                  placeholder="••••••••" 
                />
              </div>
              
              <button type="submit" className="btn-auth-pill mt-6 shadow-lg hover:shadow-[#0f172a]/20 active:scale-[0.98] transition-all">
                <LogIn size={20} /> Sign In
              </button>

              <div className="mt-10 text-center border-t border-slate-50 pt-8">
                <p className="text-[14px] text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={togglePage} 
                    className="text-[#0f172a] font-black hover:underline underline-offset-4 decoration-2"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}