export const paths = {
  home: "/",
  /**
   * Auth
   */
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    activate: "/auth/activate",
    resetPassword: "/auth/reset-password",
    updatePassword: "/auth/update-password",
  },

  /**
   * Projects
   */
  projects: "/projects",
  project: "/project",
  /**
   * Certificates
   */
  certificates: "/certificates",
  certificate: "/certificate",
  /**
   * Blog
   */
  posts: "/posts",
  post: "/post",
  /**
   * Learn
   */
  learn: "/learn",
  /**
   * Other
   */
  pricing: "/pricing",
  payment: "/payment",
  about: "/about",
  contact: "/contact",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
  support: "/support",
  stripe: {
    termsOfService: "https://stripe.com/legal/end-users",
    privacyPolicy: "https://stripe.com/privacy",
  },

  /**
   * Account
   */
  account: {
    dashboard: "/account/dashboard",
    personal: "/account/personal",
    manage: "/account/manage",
    subscription: "/account/subscription",
  },

  order: {
    completed: "/order-completed",
  },
};
