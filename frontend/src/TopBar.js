import './TopBar.css'
import WingPathLogo from './WingPathLogo.svg';
import './TopBarButton'
import TopBarButton from './TopBarButton';

function TopBar() {
  return (
    <div className="TopBar">


        <img src={WingPathLogo} alt="Logo"/>
    
        


        <div className="TopBarContent">



          <div className="ButtonMenu">

          <TopBarButton to="/">Home</TopBarButton>

          <TopBarButton to="/map">Map</TopBarButton>

          <TopBarButton to="/">Search</TopBarButton>

          <TopBarButton to="/">Commercial flights search</TopBarButton>


          <TopBarButton to="/about">About</TopBarButton>



        </div>


        <div className="AccountMenu">

          <TopBarButton to="/">Log in</TopBarButton>

          <TopBarButton to="/">Register</TopBarButton>

          



        </div>





        </div>

        
        

        
      
    </div>
  );
}

export default TopBar;
