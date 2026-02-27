import { ProfileData } from "../types/profile";
import { apiGet } from "./api.client";

type ProfileApiResponse = ProfileData;

const MOCK_PROFILE_RESPONSE: ProfileData = {
  fullName: "Alex Rivera",
  membershipLabel: "Premium Member",
  appVersion: "Version 2.4.0",
  sections: [
    {
      id: "preferences",
      items: [
        { id: "personal", title: "Personal Information", icon: "user" },
        { id: "security", title: "Security & Biometrics", icon: "key" },
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
  return {
    fullName: response.fullName,
    membershipLabel: response.membershipLabel,
    appVersion: response.appVersion,
    sections: response.sections,
  };
}

export async function getProfileData(): Promise<ProfileData> {
  try {
    const response = await apiGet<ProfileApiResponse>("/profile");
    return mapProfileResponse(response);
  } catch {
    return mapProfileResponse(MOCK_PROFILE_RESPONSE);
  }
}
