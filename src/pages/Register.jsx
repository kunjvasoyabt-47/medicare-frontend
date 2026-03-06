import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { UserPlus, XCircle, Eye, EyeOff } from 'lucide-react';
import { registerSchema } from '../lib/validation';
import { InputField } from '../components/InputField';
import { PasswordStrengthField } from '../components/PasswordStrengthField'; // Assuming you created this component
import api from '../lib/axios'; // Import your custom instance
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register({ togglePage }) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { checkAuth } = useAuth();
  const navigate = useNavigate(); // Define the navigate function

  const handleNavigation = (path) => {
    // 1. Run your local toggle logic (if needed)
    if (togglePage) togglePage();
    
    // 2. Redirect the user
    navigate(path);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-highlight" />
      <div className="auth-card-floating">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-[#0f172a] p-4 rounded-3xl mb-6 text-white shadow-xl shadow-slate-900/20">
            <UserPlus size={32} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight mb-2 uppercase flex items-center gap-2">
            Register
          </h1>
          <p className="text-slate-500 text-[15px] font-medium">Create your professional profile</p>
        </div>

        <Formik
       initialValues={{ full_name: '', email: '', gender: '', dob: '', password: '', confirmPassword: '' }}
       validationSchema={registerSchema}
       onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await api.post('/register', {
            full_name: values.full_name,
            email: values.email,
            dob: values.dob,
            gender: values.gender,
            password: values.password
          });

          // 1. Store Refresh Token for the Axios Interceptor
          localStorage.setItem('refresh_token', response.data.refresh_token);
          
          await checkAuth();

          navigate('/welcome-patient'); 

        } catch (err) {
          alert(err.response?.data?.detail || "Registration failed");
        } finally {
          setSubmitting(false);
        }
      }}
    >
          {({ errors, touched, values }) => (
            <Form>
              <InputField 
              label="Full Name" 
              name="full_name" 
              type="text" 
              placeholder="Enter your full name" 
            />
              <InputField label="Email Address" name="email" type="email" placeholder="your@email.com" />

              <div className="mb-5">
                <label className="block text-[13px] font-bold text-slate-600 mb-2 ml-4 uppercase tracking-wider">Gender</label>
                <Field as="select" name="gender" className={`form-input-field ${errors.gender && touched.gender ? 'form-input-error' : ''}`}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Field>
                {errors.gender && touched.gender && (
                  <p className="text-red-500 text-[12px] mt-1.5 ml-4 font-semibold flex items-center gap-1.5 animate-pulse">
                     <XCircle size={14} /> {errors.gender}
                  </p>
                )}
              </div>

            <InputField label="Date of Birth" name="dob" type="date" />

            <PasswordStrengthField label="Password" name="password" placeholder="••••••••" />

            <div className="w-full relative">
            <InputField 
                label="Confirm Password" 
                name="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
            />
            
            {/* Custom Show/Hide Toggle Button */}
            <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
            >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {values.confirmPassword && values.password !== values.confirmPassword && (
                <p className="text-red-500 text-[12px] mt-[-10px] mb-4 ml-4 font-semibold flex items-center gap-1.5">
                <XCircle size={14} /> Passwords do not match
                </p>
            )}
            
          
            </div>

              <button type="submit" className="btn-auth-pill mt-6">
                <UserPlus size={20} /> Register Now
              </button>

              <div className="mt-10 text-center border-t border-slate-50 pt-8">
                <p className="text-[14px] text-slate-500 font-medium">
                  Already registered?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleNavigation('/login')} 
                    className="text-[#0f172a] font-black hover:underline"
                  >
                    Sign in
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