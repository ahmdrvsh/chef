export const getFamilyMembersCount = (): number => {
  try {
    const saved = localStorage.getItem('sofreh_family_members');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read family members count', e);
  }
  return 4; // Default to 4 family members
};

export const setFamilyMembersCount = (count: number): void => {
  try {
    localStorage.setItem('sofreh_family_members', count.toString());
  } catch (e) {
    console.error('Failed to save family members count', e);
  }
};
