import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for local hardcoded admin session first
    const localAdmin = localStorage.getItem("pristine_admin_session");
    if (localAdmin) {
      const adminUser = JSON.parse(localAdmin);
      setUser(adminUser);
      setProfile({ role: "admin" });
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore Supabase updates if we are logged in as local admin
      if (localStorage.getItem("pristine_admin_session")) return;

      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, phone, location) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          location: location,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    return data;
  };

  const verifyOTP = async (email, token, type = "signup") => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      if (data.session) {
        // This helps ensure the session is recognized immediately
        fetchProfile(data.user.id);
      }
    }

    return data;
  };

  const signIn = async (email, password) => {
    // Hardcoded Admin Check (Bypasses Supabase)
    if (
      email === "pristinegadgets@admin.com" &&
      password === "@PristineGadgets2020"
    ) {
      const adminUser = {
        id: "hardcoded-admin-id",
        email: email,
        user_metadata: { role: "admin", full_name: "Pristine Admin" },
        aud: "authenticated",
        role: "authenticated",
      };

      localStorage.setItem("pristine_admin_session", JSON.stringify(adminUser));
      setUser(adminUser);
      setProfile({ role: "admin" });
      return { user: adminUser, session: { user: adminUser } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      fetchProfile(data.user.id);
    }

    return data;
  };

  const signOut = async () => {
    setIsSigningOut(true);
    try {
      if (localStorage.getItem("pristine_admin_session")) {
        localStorage.removeItem("pristine_admin_session");
      } else {
        await supabase.auth.signOut();
      }
      // Navigate FIRST before clearing user state
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setUser(null);
      setProfile(null);
      // Small delay to ensure navigation is processed before we allow redirects again
      setTimeout(() => {
        setIsSigningOut(false);
      }, 500);
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const isAdmin =
    user?.email === "pristinegadgets@admin.com" ||
    user?.user_metadata?.role === "admin" ||
    profile?.role === "admin";

  const value = {
    user,
    profile,
    isAdmin,
    signUp,
    signIn,
    signOut,
    verifyOTP,
    resetPassword,
    updatePassword,
    loading,
    isSigningOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
