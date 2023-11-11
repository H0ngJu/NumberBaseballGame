import "./Footer.css";
import LinkSvg from "./Link";

const Footer = ({ setShowModal }) => {
  return (
    <footer>
      <LinkSvg setShowModal={setShowModal} />
    </footer>
  );
};

export default Footer;
