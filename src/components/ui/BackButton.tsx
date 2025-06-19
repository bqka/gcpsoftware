import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './button';
import { ChevronLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're already on the home page (assuming home page is at "/")
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null; // Don't render the button if we're on the home page

  return (
    <Button variant={"outline"} onClick={() => navigate(-1)}><ChevronLeft /></Button> // Navigate to the Home page ("/")
  );
};

export default BackButton;