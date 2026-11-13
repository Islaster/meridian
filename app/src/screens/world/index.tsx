import { useWorld } from "./useworld";
import Frame from "@/screens/play/frame";
import Header from "./header";
import Scene from "./scene";
import Layout from "./layout";
import Below from "./below";
import Footer from "./footer";
import Overlays from "./overlays";

export default function WorldScreen() {
  const w = useWorld();
  return (
    <Frame play={w.play}>
      <Header state={w.state} />
      <Scene w={w} />
      <Layout w={w} />
      <Below w={w} />
      <Footer w={w} />
      <Overlays w={w} />
    </Frame>
  );
}
