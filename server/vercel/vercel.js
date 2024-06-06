import axios from 'axios';
import { config } from 'dotenv';

config();

const vercelToken = process.env.VERCEL_API_KEY;
const teamId = process.env.VERCEL_TEAM_ID;

const vercelAPI = axios.create({
  baseURL: 'https://api.vercel.com',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${vercelToken}`,
  },
});

export default async function createProjectAndDeploy(
  userCode,
  userId,
  urlName
) {
  try {
    const userID = userId.toLowerCase();
    const decodedUserCode = userCode.replace(/\\/g, '');

    if (urlName.includes('.html')) {
      urlName = urlName.replace('.html', '');
    }

    urlName = urlName.replace(/[^a-zA-Z0-9-]/g, '');
    const projectName = urlName + '-' + userID;

    // Check if a project with the user's ID already exists
    const existingProjects = await vercelAPI.get(
      `/v9/projects?teamId=${teamId}`
    );

    // Check if a project with the user's ID already exists
    existingProjects.data.projects.forEach((project) => {
      if (project.name.includes(userID)) {
        vercelAPI.delete(`/v9/projects/${project.id}`);
      }
    });

    const isExistingProject = existingProjects.data.projects.some(
      (project) => project.name === projectName
    );

    // Create a new project
    if (!isExistingProject) {
      await vercelAPI.post(`/v9/projects?teamId=${teamId}`, {
        name: projectName, // Set a project name
      });
    }

    // Deploy the project to production
    await vercelAPI.post(`/v13/deployments?teamId=${teamId}`, {
      name: projectName,
      target: 'production',
      files: [
        {
          file: 'index.html',
          data: decodedUserCode,
        },
      ],
    });

    const url = `https://${projectName}.vercel.app`;
    const deploymentData = { url };

    return JSON.stringify(deploymentData);
  } catch (error) {
    console.error(
      'Error creating project and deploying:',
      error.response ? error.response.data : error.message
    );
  }
}
