import { HiPencilSquare } from "react-icons/hi2";

type ProfileEditIconProps = {
  size?: number;
};

export default function ProfileEditIcon({ size = 14 }: ProfileEditIconProps) {
  return <HiPencilSquare size={size} aria-hidden />;
}
