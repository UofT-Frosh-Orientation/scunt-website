
import 'bootstrap/dist/css/bootstrap.min.css'
import { HeaderPage, HeaderParagraph, HeaderSection } from "./components/texts"

function App() {
  return (
    <div className="App">
      <HeaderPage img={require("./assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <HeaderSection> Missions </HeaderSection>
      <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
    </div>
  );
}

export default App;
