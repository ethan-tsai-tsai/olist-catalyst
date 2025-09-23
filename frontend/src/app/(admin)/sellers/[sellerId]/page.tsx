import { Metadata } from "next";
import SellerDetailsClientPage from "./SellerDetailsClientPage";

export const metadata: Metadata = {
  title: "Seller Details | Olist Seller Success Dashboard",
  description: "Detailed analytics and insights for a specific seller.",
};

// This is the main Server Component for the page.
// It handles server-side logic like reading route parameters.
const SellerDetailsPage = ({ params }: { params: { sellerId: string } }) => {
  const { sellerId } = params;

  // It then renders the Client Component, passing down the necessary data as props.
  // This separation of concerns is a key pattern in the Next.js App Router.
  return <SellerDetailsClientPage sellerId={sellerId} />;
};

export default SellerDetailsPage;