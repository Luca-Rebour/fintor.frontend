export type ProfileMenuItem = {
  id: string;
  title: string;
  icon: "User" | "Key" | "Bell" | "CreditCard" | "CircleHelp";
  badgeText?: string;
};

export type ProfileMenuSection = {
  id: string;
  items: ProfileMenuItem[];
};

export type ProfileData = {
  fullName: string;
  membershipLabel: string;
  appVersion: string;
  sections: ProfileMenuSection[];
};
