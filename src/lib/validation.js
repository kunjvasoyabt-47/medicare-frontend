import * as Yup from "yup";

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
const emailLiveRegex = /@.*\./;
const maxAgeDate = new Date();
maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 150);

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      emailLiveRegex,
      "Email must contain @ and . (e.g., example@mail.com)",
    )
    .email("Invalid email format")
    .required("Required"),
  password: Yup.string().required("Required"),
});

export const profileUpdateSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed")
    .required("Full Name is required"),
  email: Yup.string()
    .matches(emailLiveRegex, "Email must contain @ and .")
    .email("Invalid email format")
    .required("Email is required"),
  phone_number: Yup.string()
    .nullable()
    .test(
      "phone",
      "Enter a valid phone number (7–15 digits)",
      (v) => !v || /^\+?[0-9]{7,15}$/.test(v),
    ),
  dob: Yup.string()
    .nullable()
    .test("dob-future", "DOB cannot be in the future", (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    })
    .test("dob-age", "Age cannot exceed 150 years", (v) => {
      if (!v) return true;
      const limit = new Date();
      limit.setFullYear(limit.getFullYear() - 150);
      return new Date(v) >= limit;
    }),
  address: Yup.string()
    .nullable()
    .test(
      "addr-min",
      "Address must be at least 5 characters",
      (v) => !v || v.trim().length >= 5,
    ),
});

export const registerSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed")
    .required("Full Name is required"),
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
  country_code: Yup.string()
    .required("Country code is required")
    .matches(/^\+\d{1,3}$/, "Invalid country code format"),
  phone_number: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{7,15}$/, "Phone number must be 7-15 digits"),
  password: Yup.string()
    .min(8, "Min 8 characters")
    .matches(passwordRegex, "Need: 1 Upper, 1 Lower, 1 Num, 1 Special")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});
