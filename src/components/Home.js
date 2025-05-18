// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';

// const Home = ({ idToken }) => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
//   const fileInputRef = useRef(null);
  
//   const [editTask, setEditTask] = useState({
//     taskId: '',
//     title: '',
//     description: '',
//     imageUrl: '',
//   });
//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     imageUrl: '',
//   });

//   const API_BASE = 'https://6npx0qo69j.execute-api.ap-south-1.amazonaws.com/dev';
//   const PRESIGNED_URL_ENDPOINT = 'https://6npx0qo69j.execute-api.ap-south-1.amazonaws.com/dev/generate-presigned-url';

//   const fetchTasks = async () => {
//     try {
//       const response = await axios.get(`${API_BASE}/tasks`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${idToken}`,
//         },
//       });
//       setTasks(response.data.tasks);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching tasks:', error);
//       setLoading(false);
//     }
//   };

//   const markAsComplete = async (taskId) => {
//     try {
//       const taskToUpdate = tasks.find((task) => task.taskId === taskId);
//       const updatedTask = {
//         taskId,
//         title: taskToUpdate.title,
//         description: taskToUpdate.description,
//         imageUrl: taskToUpdate.imageUrl,
//         completed: true,
//       };

//       await axios.put(
//         `${API_BASE}/tasks`,
//         updatedTask,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${idToken}`,
//           },
//         }
//       );

//       setTasks((prevTasks) =>
//         prevTasks.map((task) =>
//           task.taskId === taskId ? { ...task, isCompleted: true } : task
//         )
//       );
//     } catch (error) {
//       console.error('Error marking task as complete:', error);
//     }
//   };

//   const deleteTask = async (taskId) => {
//     try {
//       await axios.delete(`${API_BASE}/tasks`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${idToken}`,
//         },
//         data: { taskId },
//       });
//       setTasks((prevTasks) => prevTasks.filter((task) => task.taskId !== taskId));
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   };

//   const openEditModal = (task) => {
//     setEditTask({
//       taskId: task.taskId,
//       title: task.title,
//       description: task.description,
//       imageUrl: task.imageUrl,
//     });
//     setIsModalOpen(true);
//   };

//   const handleUpdateTask = async (e) => {
//     e.preventDefault();

//     const updatedTask = {
//       taskId: editTask.taskId,
//       title: editTask.title,
//       description: editTask.description,
//       imageUrl: editTask.imageUrl,
//       completed: false,
//     };

//     try {
//       await axios.put(`${API_BASE}/tasks`, updatedTask, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${idToken}`,
//         },
//       });

//       setTasks((prevTasks) =>
//         prevTasks.map((task) =>
//           task.taskId === editTask.taskId ? { ...task, ...updatedTask } : task
//         )
//       );
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error('Error updating task:', error);
//     }
//   };

//   // Handle file selection
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setSelectedImage(file);
    
//     // Create a preview of the selected image
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreview(previewUrl);
//   };

//   // Upload image to S3 and get the URL
//   const uploadImageToS3 = async (file) => {
//     if (!file) return null;
    
//     setUploadingImage(true);
    
//     try {
//       // Generate a unique filename
//       const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
//       // Request a presigned URL from your Lambda
//       const presignedUrlResponse = await axios.post(
//         PRESIGNED_URL_ENDPOINT,
//         {
//           fileName: fileName,
//           fileType: file.type
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${idToken}`
//           }
//         }
//       );
      
//       const { uploadURL } = presignedUrlResponse.data;
      
//       // Upload the file directly to S3 using the presigned URL
//       await axios.put(uploadURL, file, {
//         headers: {
//           'Content-Type': file.type
//         }
//       });
      
//       // Return the URL where the image will be publicly accessible
//       // This depends on your S3 bucket configuration
//       return `https://todo-task-images-poc.s3.ap-south-1.amazonaws.com/${fileName}`;
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       return null;
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   // Handle adding a new task with image upload
//   const handleAddTask = async (e) => {
//     e.preventDefault();
    
//     try {
//       // Upload image first if there is one
//       let imageUrl = newTask.imageUrl;
      
//       if (selectedImage) {
//         imageUrl = await uploadImageToS3(selectedImage);
//         if (!imageUrl) {
//           alert('Failed to upload image. Please try again.');
//           return;
//         }
//       }

//       const newTaskData = {
//         title: newTask.title,
//         description: newTask.description,
//         imageUrl: imageUrl,
//       };

//       const response = await axios.post(`${API_BASE}/tasks`, newTaskData, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${idToken}`,
//         },
//       });

//       setTasks((prevTasks) => [
//         ...prevTasks,
//         {
//           ...newTaskData,
//           taskId: response.data.taskId,
//           createdAt: new Date().toISOString(),
//           isCompleted: false,
//         },
//       ]);
      
//       // Reset form and close modal
//       setIsAddTaskModalOpen(false);
//       setNewTask({ title: '', description: '', imageUrl: '' });
//       setSelectedImage(null);
//       setImagePreview('');
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (error) {
//       console.error('Error adding task:', error);
//     }
//   };

//   // Reset image state when closing modal
//   const handleCloseAddModal = () => {
//     setIsAddTaskModalOpen(false);
//     setSelectedImage(null);
//     setImagePreview('');
//     setNewTask({ title: '', description: '', imageUrl: '' });
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   useEffect(() => {
//     if (idToken) {
//       fetchTasks();
//     }
//   }, [idToken]);

//   if (loading) return <div className="text-center mt-5">Loading tasks...</div>;

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Todo List</h2>

//       {/* Add Task Button */}
//       <button
//         className="btn btn-primary mb-4"
//         onClick={() => setIsAddTaskModalOpen(true)}
//       >
//         Add Task
//       </button>

//       <div className="row">
//         {tasks.map((task) => (
//           <div key={task.taskId} className="col-md-4 mb-4">
//             <div
//               className={`card h-100 shadow-sm ${task.isCompleted ? 'bg-light text-muted' : ''}`}
//               style={{
//                 filter: task.isCompleted ? 'grayscale(80%) blur(1px)' : 'none',
//               }}
//             >
//               <img
//                 src={task.imageUrl}
//                 className="card-img-top"
//                 alt={task.title}
//                 style={{ height: '200px', objectFit: 'cover' }}
//               />
//               <div className="card-body">
//                 <h5 className="card-title">{task.title}</h5>
//                 <p className="card-text">{task.description}</p>
//               </div>
//               <div className="card-footer d-flex justify-content-between align-items-center">
//                 <small>Created At: {new Date(task.createdAt).toLocaleString()}</small>
//               </div>
//               <div className="card-footer d-flex justify-content-between">
//                 {!task.isCompleted && (
//                   <button
//                     className="btn btn-sm btn-success"
//                     onClick={() => markAsComplete(task.taskId)}
//                   >
//                     Mark as Complete
//                   </button>
//                 )}
//                 <button
//                   className="btn btn-sm btn-primary"
//                   onClick={() => openEditModal(task)}
//                 >
//                   Update Task
//                 </button>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => deleteTask(task.taskId)}
//                 >
//                   Delete Task
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal for adding task with image upload */}
//       {isAddTaskModalOpen && (
//         <div className="modal fade show" style={{ display: 'block' }} aria-labelledby="addTaskModalLabel">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Add Task</h5>
//                 <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
//               </div>
//               <div className="modal-body">
//                 <form onSubmit={handleAddTask}>
//                   <div className="mb-3">
//                     <label htmlFor="taskTitle" className="form-label">Title</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       id="taskTitle"
//                       value={newTask.title}
//                       onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label htmlFor="taskDescription" className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       id="taskDescription"
//                       value={newTask.description}
//                       onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label htmlFor="taskImage" className="form-label">Upload Image</label>
//                     <input
//                       type="file"
//                       className="form-control"
//                       id="taskImage"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                       ref={fileInputRef}
//                     />
//                     {imagePreview && (
//                       <div className="mt-2">
//                         <img 
//                           src={imagePreview} 
//                           alt="Preview" 
//                           style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
//                           className="mt-2 border rounded"
//                         />
//                       </div>
//                     )}
//                   </div>
//                   <div className="mb-3">
//                     <label htmlFor="taskImageUrl" className="form-label">Or Enter Image URL (optional if uploading)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       id="taskImageUrl"
//                       value={newTask.imageUrl}
//                       onChange={(e) => setNewTask({ ...newTask, imageUrl: e.target.value })}
//                       disabled={selectedImage !== null}
//                     />
//                     <small className="text-muted">
//                       {selectedImage ? "Image URL is disabled when uploading an image" : "You can either upload an image or provide a URL"}
//                     </small>
//                   </div>
//                   <button 
//                     type="submit" 
//                     className="btn btn-primary" 
//                     disabled={uploadingImage}>
//                     {uploadingImage ? 'Uploading...' : 'Add Task'}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal for editing task */}
//       {isModalOpen && (
//         <div className="modal fade show" style={{ display: 'block' }} aria-labelledby="editTaskModalLabel">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Update Task</h5>
//                 <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <form onSubmit={handleUpdateTask}>
//                   <div className="mb-3">
//                     <label htmlFor="taskTitle" className="form-label">Title</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       id="taskTitle"
//                       value={editTask.title}
//                       onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label htmlFor="taskDescription" className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       id="taskDescription"
//                       value={editTask.description}
//                       onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label htmlFor="taskImageUrl" className="form-label">Image URL</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       id="taskImageUrl"
//                       value={editTask.imageUrl}
//                       onChange={(e) => setEditTask({ ...editTask, imageUrl: e.target.value })}
//                     />
//                   </div>
//                   <button type="submit" className="btn btn-primary">Update Task</button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default Home;


import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Home = ({ idToken}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  const [editTask, setEditTask] = useState({
    taskId: '',
    title: '',
    description: '',
    imageUrl: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [selectedEditImage, setSelectedEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const editFileInputRef = useRef(null);

  const API_BASE = 'https://6npx0qo69j.execute-api.ap-south-1.amazonaws.com/dev';
  const PRESIGNED_URL_ENDPOINT = 'https://6npx0qo69j.execute-api.ap-south-1.amazonaws.com/dev/generate-presigned-url';

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      setTasks(response.data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const markAsComplete = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task.taskId === taskId);
      const updatedTask = {
        taskId,
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        imageUrl: taskToUpdate.imageUrl,
        completed: true,
      };

      await axios.put(
        `${API_BASE}/tasks`,
        updatedTask,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, isCompleted: true } : task
        )
      );
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        data: { taskId },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.taskId !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditModal = (task) => {
    setEditTask({
      taskId: task.taskId,
      title: task.title,
      description: task.description,
      imageUrl: task.imageUrl,
    });
    setEditImagePreview(task.imageUrl);
    setSelectedEditImage(null);
    setIsModalOpen(true);
  };

  // Handle file change for edit modal
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedEditImage(file);
    
    // Create a preview of the selected image
    const previewUrl = URL.createObjectURL(file);
    setEditImagePreview(previewUrl);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    try {
      setUploadingImage(true);
      
      // Upload image first if there is one
      let imageUrl = editTask.imageUrl;
      
      if (selectedEditImage) {
        imageUrl = await uploadImageToS3(selectedEditImage);
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          setUploadingImage(false);
          return;
        }
      }

      const updatedTask = {
        taskId: editTask.taskId,
        title: editTask.title,
        description: editTask.description,
        imageUrl: imageUrl,
        completed: false,
      };

      await axios.put(`${API_BASE}/tasks`, updatedTask, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === editTask.taskId ? { ...task, ...updatedTask } : task
        )
      );
      
      // Reset and close modal
      setIsModalOpen(false);
      setSelectedEditImage(null);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setSelectedEditImage(null);
    setEditImagePreview('');
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    
    // Create a preview of the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Upload image to S3 and get the URL
  const uploadImageToS3 = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    
    try {
      // Generate a unique filename
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Request a presigned URL from your Lambda
      const presignedUrlResponse = await axios.post(
        PRESIGNED_URL_ENDPOINT,
        {
          fileName: fileName,
          fileType: file.type
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      
      const { uploadURL } = presignedUrlResponse.data;
      
      // Upload the file directly to S3 using the presigned URL
      await axios.put(uploadURL, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      
      // Return the URL where the image will be publicly accessible
      // This depends on your S3 bucket configuration
      return `https://todo-task-images-poc.s3.ap-south-1.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle adding a new task with image upload
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    try {
      // Upload image first if there is one
      let imageUrl = newTask.imageUrl;
      
      if (selectedImage) {
        imageUrl = await uploadImageToS3(selectedImage);
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const newTaskData = {
        title: newTask.title,
        description: newTask.description,
        imageUrl: imageUrl,
      };

      const response = await axios.post(`${API_BASE}/tasks`, newTaskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      setTasks((prevTasks) => [
        ...prevTasks,
        {
          ...newTaskData,
          taskId: response.data.taskId,
          createdAt: new Date().toISOString(),
          isCompleted: false,
        },
      ]);
      
      // Reset form and close modal
      setIsAddTaskModalOpen(false);
      setNewTask({ title: '', description: '', imageUrl: '' });
      setSelectedImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Reset image state when closing modal
  const handleCloseAddModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedImage(null);
    setImagePreview('');
    setNewTask({ title: '', description: '', imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchTasks();
    }
  }, [idToken]);

  if (loading) return <div className="text-center mt-5">Loading tasks...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Todo List</h2>

      {/* Add Task Button */}
      <button
        className="btn btn-primary mb-4"
        onClick={() => setIsAddTaskModalOpen(true)}
      >
        Add Task
      </button>

      <div className="row">
        {tasks.map((task) => (
          <div key={task.taskId} className="col-md-4 mb-4">
            <div
              className={`card h-100 shadow-sm ${task.isCompleted ? 'bg-light text-muted' : ''}`}
              style={{
                filter: task.isCompleted ? 'grayscale(80%) blur(1px)' : 'none',
              }}
            >
              <img
                src={task.imageUrl}
                className="card-img-top"
                alt={task.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">{task.description}</p>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center">
                <small>Created At: {new Date(task.createdAt).toLocaleString()}</small>
              </div>
              <div className="card-footer d-flex justify-content-between">
                {!task.isCompleted && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => markAsComplete(task.taskId)}
                  >
                    Mark as Complete
                  </button>
                )}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openEditModal(task)}
                >
                  Update Task
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteTask(task.taskId)}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding task with image upload */}
      {isAddTaskModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }} aria-labelledby="addTaskModalLabel">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Task</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddTask}>
                  <div className="mb-3">
                    <label htmlFor="taskTitle" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="taskDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="taskDescription"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="taskImage" className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className="form-control"
                      id="taskImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                          className="mt-2 border rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    {/* <label htmlFor="taskImageUrl" className="form-label">Or Enter Image URL (optional if uploading)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="taskImageUrl"
                      value={newTask.imageUrl}
                      onChange={(e) => setNewTask({ ...newTask, imageUrl: e.target.value })}
                      disabled={selectedImage !== null}
                    />
                    <small className="text-muted">
                      {selectedImage ? "Image URL is disabled when uploading an image" : "You can either upload an image or provide a URL"}
                    </small> */}
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : 'Add Task'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing task */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }} aria-labelledby="editTaskModalLabel">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Task</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateTask}>
                  <div className="mb-3">
                    <label htmlFor="editTaskTitle" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editTaskTitle"
                      value={editTask.title}
                      onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editTaskDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="editTaskDescription"
                      value={editTask.description}
                      onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editTaskImage" className="form-label">Upload New Image</label>
                    <input
                      type="file"
                      className="form-control"
                      id="editTaskImage"
                      accept="image/*"
                      onChange={handleEditFileChange}
                      ref={editFileInputRef}
                    />
                    {editImagePreview && (
                      <div className="mt-2">
                        <img 
                          src={editImagePreview} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                          className="mt-2 border rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    {/* <label htmlFor="editTaskImageUrl" className="form-label">Or Enter Image URL</label> */}
                    {/* <input
                      type="text"
                      className="form-control"
                      id="editTaskImageUrl"
                      value={editTask.imageUrl}
                      onChange={(e) => setEditTask({ ...editTask, imageUrl: e.target.value })}
                      disabled={selectedEditImage !== null}
                    /> */}
                    {/* <small className="text-muted">
                      {selectedEditImage ? "Image URL is disabled when uploading a new image" : "You can either upload an image or provide a URL"}
                    </small> */}
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : 'Update Task'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;