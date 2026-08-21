import { useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import { useEffect } from "react";

export default function MakePayments() {
  const { isLogin } = useStates();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) {
      navigate("/");
    }
  }, []);
  return <div>Make Payment</div>;
}
