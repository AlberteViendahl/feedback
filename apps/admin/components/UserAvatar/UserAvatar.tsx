import { Icon } from "@/components/Icons/Icon";

type UserAvatarProps = {
  name: string;
};

/** The user's initial on a circle. Decorative: the name itself is shown in the side menu. */
export function UserAvatar({ name }: UserAvatarProps) {
  return (
    <span className="icon-stack" aria-hidden="true">
      <Icon name="user-avatar" />
      <span className="user-avatar__initial">{name.charAt(0).toUpperCase()}</span>
    </span>
  );
}
