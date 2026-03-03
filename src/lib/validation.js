import * as Yup from 'yup';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
const emailLiveRegex = /@.*\./;
const maxAgeDate = new Date();
maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 150);

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailLiveRegex, "Email must contain @ and . (e.g., example@mail.com)")
    .email("Invalid email format")
    .required("Required"),
  password: Yup.string().required("Required"),
});


export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailLiveRegex, "Email must contain @ and .")
    .email("Invalid email format")
    .required("Required"),
  gender: Yup.string().required("Required"),
  dob: Yup.date()
    /* Ensures date isn't in the future */
    .max(new Date(), "DOB cannot be in the future") 
    /* Ensures user isn't older than 150 years */
    .min(maxAgeDate, "Age cannot exceed 150 years") 
    .required("Required"),
  password: Yup.string()
    .min(8, "Min 8 characters")
    .matches(passwordRegex, "Need: 1 Upper, 1 Lower, 1 Num, 1 Special")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("Required"),
});