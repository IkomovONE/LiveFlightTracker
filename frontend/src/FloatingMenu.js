import './FloatingMenu.css'
import WingPathLogo from './WingPathLogo.svg';
import './TopBarButton'
import TopBarButton from './TopBarButton';

function FloatingMenu({ className }) {
  return (
    <div className={`FloatingMenu ${className || ''}`}>


       
    
        


        <div className="FloatingMenuContent">



          <div className="FloatingMenuButtonMenu">

          <TopBarButton className='floatButton' to="/">Home</TopBarButton>

          <TopBarButton className='floatButton' to="/map">Map</TopBarButton>

          <TopBarButton className='floatButton' to="/">Search</TopBarButton>

          <TopBarButton className='floatButton' to="/">Flights search</TopBarButton>


          <TopBarButton className='floatButton' to="/about">About</TopBarButton>



        </div>

        <hr style={{ border: 'none', borderTop: '3px solid rgba(116, 223, 255, 0.678)', marginTop: '10px', width: '100%', marginLeft: '0px'}} />


        <div className="FloatingMenuAccountMenu">

          <TopBarButton className='floatButton' to="/">Log in</TopBarButton>

          <TopBarButton className='floatButton' to="/">Register</TopBarButton>

          



        </div>





        </div>

        
        

        
      
    </div>
  );
}

export default FloatingMenu;
