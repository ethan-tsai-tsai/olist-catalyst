import { Metadata } from "next";
import { use } from 'react';
import SellerDetailsClientPage from "./SellerDetailsClientPage";

export const metadata: Metadata = {
  title: "Seller Details | Olist Seller Success Dashboard",
  description: "Detailed analytics and insights for a specific seller.",
};

// This is the main Server Component for the page.
// It handles server-side logic like reading route parameters.
const SellerDetailsPage = ({ params }: { params: { sellerId: string } }) => {
  // In Next.js 15, params can be treated as a promise-like object.
  // We use React's `use` hook to unwrap it, which is the recommended pattern.
  const { sellerId } = use(params);

  // It then renders the Client Component, passing down the necessary data as props.
  return <SellerDetailsClientPage sellerId={sellerId} />;
};

export default SellerDetailsPage;