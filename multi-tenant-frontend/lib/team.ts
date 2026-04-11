import API from "./api"

// ✅ convert backend MongoDB object → frontend safe object
const normalizeTeam = (team: any) => {
  return {
    ...team,
    id: team._id || team.id, // handles both cases safely
  }
}

// ================= CREATE TEAM =================
export const createTeamAPI = async (name: string, description: string) => {
  const res = await API.post("/teams/create", {
    name,
    description,
  })

  return normalizeTeam(res.data)
}

 

// ================= JOIN TEAM =================
export const joinTeamAPI = async (code: string) => {
  const res = await API.post("/teams/join", {
    code,
  })

  

  return normalizeTeam(res.data)
}

export const getMyTeamsAPI = async () => {
  const res = await API.get("/teams")
  return res.data
}