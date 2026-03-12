import { ProfileData } from "../types/profile";
import { apiGet } from "./api.client";

type ProfileApiResponse = ProfileData;

const ALLOWED_PROFILE_ITEM_IDS = new Set(["personal", "notifications", "help"]);

const MOCK_PROFILE_RESPONSE: ProfileData = {
  fullName: "Alex Rivera",
  membershipLabel: "Premium Member",
  appVersion: "Version 2.4.0",
  sections: [
    {
      id: "preferences",
      items: [
        { id: "personal", title: "Personal Information", icon: "User" },
        { id: "notifications", title: "Notification Preferences", icon: "Bell" },
      ],
    },
    {
      id: "support",
      items: [
        { id: "help", title: "Help & Support", icon: "CircleHelp" },
      ],
    },
  ],
};

function sanitizeProfileSections(sections: ProfileData["sections"]): ProfileData["sections"] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => ALLOWED_PROFILE_ITEM_IDS.has(item.id)),
    }))
    .filter((section) => section.items.length > 0);
}

function mapProfileResponse(response: ProfileApiResponse): ProfileData {
  return {
    fullName: response.fullName,
    membershipLabel: response.membershipLabel,
    appVersion: response.appVersion,
    sections: sanitizeProfileSections(response.sections),
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
