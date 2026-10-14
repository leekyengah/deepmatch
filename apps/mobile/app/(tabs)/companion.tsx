import { useEffect } from "react";
import { router } from "expo-router";
import { SkeletonLoader, PremiumScreen } from "../../components/premium";

/** Legacy tab → native services (M09) */
export default function CompanionRedirect() {
  useEffect(() => {
    router.replace("/services/" as never);
  }, []);
  return (
    <PremiumScreen>
      <SkeletonLoader />
    </PremiumScreen>
  );
}
