import { ProfileData } from "../types/profile";

type ProfileApiResponse = ProfileData;

const MOCK_PROFILE_RESPONSE: ProfileApiResponse = {
  fullName: "Alex Rivera",
  membershipLabel: "Premium Member",
  appVersion: "Version 2.4.0",
  sections: [
    {
      id: "preferences",
      items: [
        { id: "personal", title: "Personal Information", icon: "user" },
        { id: "security", title: "Security & Biometrics", icon: "fingerprint" },
        { id: "notifications", title: "Notification Preferences", icon: "bell" },
      ],
    },
    {
      id: "support",
      items: [
        { id: "bank", title: "Linked Bank Accounts", icon: "credit-card", badgeText: "3 Active" },
        { id: "help", title: "Help & Support", icon: "help-circle" },
      ],
    },
  ],
};

function mapProfileResponse(response: ProfileApiResponse): ProfileData {
  return response;
}

export async function getProfileData(): Promise<ProfileData> {
  return mapProfileResponse(MOCK_PROFILE_RESPONSE);
}
