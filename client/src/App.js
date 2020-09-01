import HeadBar from './Components/HeadBar';
import Switch from './Components/Switch';
import ActionScene from './Components/ActionScene';
import Login from './Components/Login';
import Credits from './Components/Creds';

class App extends React.Components {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return(
            <div>
                <HeadBar mid={<Switch />} />
                <ActionScene encase={<Login />} />
                <Credits />
            </div>
        );
    };
}
export default App;