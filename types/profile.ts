export type ProfileMenuItem = {
  id: string;
  title: string;
  icon: "user" | "fingerprint" | "bell" | "credit-card" | "help-circle";
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
