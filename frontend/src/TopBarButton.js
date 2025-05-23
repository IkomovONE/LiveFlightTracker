import './TopBar.css';
import { Link } from 'react-router-dom';

const TopBarButton = ({ className = '', children, to }) => {
  return (
    <Link to={to} className={`TopBarButton ${className}`}>
      {children}
    </Link>
  );
};

export default TopBarButton;
