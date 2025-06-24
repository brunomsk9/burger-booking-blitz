
export const getFranchiseDisplayName = (franchise: {
  company_name: string | null;
  name: string;
}): string => {
  return franchise.company_name || franchise.name;
};

export const formatFranchiseForDisplay = (franchise: {
  id: string;
  name: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  active: boolean;
  logo_url: string | null;
  created_at: string;
}) => {
  return {
    ...franchise,
    displayName: getFranchiseDisplayName(franchise)
  };
};
