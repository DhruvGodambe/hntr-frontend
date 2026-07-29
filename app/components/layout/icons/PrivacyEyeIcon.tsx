import { HiEye, HiEyeSlash } from "react-icons/hi2";

type PrivacyEyeIconProps = {
  hidden: boolean;
  size?: number;
};

export default function PrivacyEyeIcon({ hidden, size = 15 }: PrivacyEyeIconProps) {
  return hidden ? <HiEyeSlash size={size} aria-hidden /> : <HiEye size={size} aria-hidden />;
}
