import API from "./api"

// GET members of a team
export const getMembersAPI = async (teamId: string) => {
  const res = await API.get(`/teams/${teamId}/members`)
  return res.data
}

// UPDATE role
export const updateRoleAPI = async (teamId: string, userId: string, role: string) => {
  const res = await API.patch(`/members/role`, {
    teamId,
    userId,
    role,
  })
  return res.data
}

// REMOVE member
export const removeMemberAPI = async (userId: string) => {
  const res = await API.delete(`/members/${userId}`)
  return res.data
}