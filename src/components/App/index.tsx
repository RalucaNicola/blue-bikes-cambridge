import BasemapToggle from '../BasemapToggle';
import BottomPanel from '../BottomPanel';
import Popup from '../Popup';
import { ErrorAlert } from '../ErrorAlert';
import { Identity } from '../Identity';
import InfoModal from '../InfoModal';
import Map from '../Map';

const App = () => {
  return (
    <>
      <Map></Map>
      <BasemapToggle></BasemapToggle>
      <BottomPanel></BottomPanel>
      <Popup></Popup>
      <ErrorAlert></ErrorAlert>
      <Identity></Identity>
      <InfoModal></InfoModal>
    </>
  );
};

export default App;
