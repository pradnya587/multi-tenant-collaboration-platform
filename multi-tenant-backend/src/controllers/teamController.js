import Team from "../models/Team.js";

// ================= CREATE TEAM =================
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = await Team.create({
      name,
      description,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(), // simple join code
      members: [
        {
          userId: req.user.userId,
          role: "admin",
        },
      ],
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET TEAMS =================
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      "members.userId": req.user.userId,
    });

    res.json(teams);
  } catch (error) {
    console.error("Get Teams Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= JOIN TEAM =================
export const joinTeam = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Team code is required" });
    }

    const team = await Team.findOne({ code });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // check if already a member
    const alreadyMember = team.members.some(
      (m) => m.userId.toString() === req.user.userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    team.members.push({
      userId: req.user.userId,
      role: "member",
    });

    await team.save();

    res.json(team);
  } catch (error) {
    console.error("Join Team Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MEMBERS =================
export const getMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "members.userId",
      "name email"
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team.members);
  } catch (error) {
    console.error("Get Members Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ROLE =================
export const updateRole = async (req, res) => {
  try {
    const { teamId, userId, role } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const member = team.members.find(
      (m) => m.userId.toString() === userId
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.role = role;

    await team.save();

    res.json({ message: "Role updated successfully", team });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= REMOVE MEMBER =================
export const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.members = team.members.filter(
      (m) => m.userId.toString() !== userId
    );

    await team.save();

    res.json({ message: "Member removed successfully", team });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: error.message });
  }
};