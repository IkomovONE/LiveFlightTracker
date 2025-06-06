import './FloatingMenu.css'
import WingPathLogo from './WingPathLogo.svg';
import './TopBarButton'
import TopBarButton from './TopBarButton';

function FloatingMenu({ className }) {
  return (
    <div className={`FloatingMenu ${className || ''}`}>


       
    
        


        <div className="FloatingMenuContent">



          <div className="FloatingMenuButtonMenu">

          <TopBarButton to="/">Home</TopBarButton>

          <TopBarButton to="/map">Map</TopBarButton>

          <TopBarButton to="/">Search</TopBarButton>

          <TopBarButton to="/">Flights search</TopBarButton>


          <TopBarButton to="/about">About</TopBarButton>



        </div>


        <div className="FloatingMenuAccountMenu">

          <TopBarButton to="/">Log in</TopBarButton>

          <TopBarButton to="/">Register</TopBarButton>

          



        </div>





        </div>

        
        

        
      
    </div>
  );
}

export default FloatingMenu;
