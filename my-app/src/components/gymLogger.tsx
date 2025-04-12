import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { dividerClasses } from '@mui/material';

// Define the Set type
interface ExerciseSet {
  reps: number;
  weight: number;
}

// Define the Exercise type
interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

const PushDayTracker = ({type, pushDay, setPushDay, pullDay, setPullDay}) => {
  // Convert the initial state to use the new ExerciseSet structure


  // State for editing
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);

  
  // State for expanded exercise details
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  // Handle editing an exercise
  const handleEdit = (index: number) => {
    setEditIndex(index);
    if (type === 'push') {
      setEditExercise(JSON.parse(JSON.stringify(pushDay[index])));
    } else if (type === 'pull') {
      setEditExercise(JSON.parse(JSON.stringify(pullDay[index])));
    }
  };

  // Handle saving edits
  const handleSave = () => {
    if (editIndex !== null && editExercise) {
        if(type == 'push'){
            const updatedPushDay = [...pushDay];
            updatedPushDay[editIndex] = editExercise;
            setPushDay(updatedPushDay);
            setEditIndex(null);
            setEditExercise(null);
        } else if (type == 'pull'){
            const updatedPullDay = [...pullDay];
            updatedPullDay[editIndex] = editExercise;
            setPullDay(updatedPullDay);
            setEditIndex(null);
            setEditExercise(null);
        }

    }
  };

  // Handle canceling edits
  const handleCancel = () => {
    setEditIndex(null);
    setEditExercise(null);
  };

  // Handle deleting an exercise
  const handleDelete = (index: number) => {
    if(type == 'push'){
        const updatedPushDay = pushDay.filter((_, i) => i !== index);
        setPushDay(updatedPushDay);
    } else if (type == 'pull'){
        const updatedPullDay = pullDay.filter((_, i) => i !== index);
        setPullDay(updatedPullDay);
    }

  };



  // Handle editing set data
  const handleEditSet = (setIndex: number, field: keyof ExerciseSet, value: number) => {
    if (editExercise) {
      const updatedSets = [...editExercise.sets];
      updatedSets[setIndex] = { 
        ...updatedSets[setIndex], 
        [field]: value 
      };
      setEditExercise({ ...editExercise, sets: updatedSets });
    }
  };

  // Add a set to the exercise being edited
  const handleAddSet = () => {
    if (editExercise) {
      const lastSet = editExercise.sets[editExercise.sets.length - 1] || { reps: 8, weight: 0 };
      setEditExercise({
        ...editExercise,
        sets: [...editExercise.sets, { ...lastSet }] // Copy the last set's values for convenience
      });
    }
  };

  // Remove a set from the exercise being edited
  const handleRemoveSet = (setIndex: number) => {
    if (editExercise && editExercise.sets.length > 1) {
      const updatedSets = editExercise.sets.filter((_, i) => i !== setIndex);
      setEditExercise({ ...editExercise, sets: updatedSets });
    }
  };


  // Toggle expanded view
  const toggleExpand = (index: number) => {
    if (expandedExercise === index) {
      setExpandedExercise(null);
    } else {
      setExpandedExercise(index);
    }
  };

  // Calculate total volume for an exercise
  const calculateTotalVolume = (exercise: Exercise) => {
    return exercise.sets.reduce((total, set) => total + (set.reps * set.weight), 0);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow h-full">
      
      {/* Exercise List */}
      <div className="space-y-4 mb-0">
        {type == 'push' ? 
        (pushDay.map((exercise, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            {editIndex === index ? (
              // Edit Form
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                  <h5 className="w-full p-2 border-gray-300 rounded-md text-left font-bold" >{editExercise?.name || ''}</h5>
               
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Sets</h3>
                    <div
                      onClick={handleAddSet}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center gap-1 hover:bg-blue-200"
                    >
                      <Plus size={14} /> Add Set
                    </div>
                  </div>
                  
                  {editExercise?.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center mb-3 gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                        {setIndex + 1}
                      </div>
                      
                      <div className="flex-grow grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleEditSet(setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleEditSet(setIndex, 'weight', parseInt(e.target.value) || 0)}
                            className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      {editExercise.sets.length > 1 && (
                        <div
                          onClick={() => handleRemoveSet(setIndex)}
                          className="flex-shrink-0 p-1 text-red-600 rounded hover:bg-red-50"
                          aria-label="Remove set"
                        >
                          <Trash2 size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <div
                    onClick={handleCancel}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md flex items-center gap-1 hover:bg-gray-300"
                  >
                    <X size={16} /> Cancel
                  </div>
                  <div
                    onClick={handleSave}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center gap-1 hover:bg-blue-700"
                  >
                    <Save size={16} /> Save
                  </div>
                </div>
              </div>
            ) : (
              // Exercise Display
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <div 
                        onClick={() => toggleExpand(index)}
                        className="mr-2 focus:outline-none text-gray-500 hover:text-gray-700"
                      >
                        {expandedExercise === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {exercise.sets.length} sets • Total volume: {calculateTotalVolume(exercise)} kg
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div
                      onClick={() => handleEdit(index)}
                      className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50"
                      aria-label="Edit exercise"
                    >
                      <Edit2 size={18} />
                    </div>
                    <div
                      onClick={() => handleDelete(index)}
                      className="p-1.5 text-red-600 rounded-md hover:bg-red-50"
                      aria-label="Delete exercise"
                    >
                      <Trash2 size={18} />
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedExercise === index && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Set Details</h4>
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center">
                          <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium mr-3">
                            {setIndex + 1}
                          </span>
                          <div className="flex items-center text-sm">
                            <span className="font-medium text-gray-700">{set.reps} reps</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="font-medium text-gray-700">{set.weight} kg</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-500">Volume: {set.reps * set.weight} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )))
        :type == 'pull' ?
        (pullDay.map((exercise, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              {editIndex === index ? (
                // Edit Form
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                    <h5 className="w-full p-2 border-gray-300 rounded-md text-left font-bold" >{editExercise?.name || ''}</h5>
                 
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Sets</h3>
                      <div
                        onClick={handleAddSet}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center gap-1 hover:bg-blue-200"
                      >
                        <Plus size={14} /> Add Set
                      </div>
                    </div>
                    
                    {editExercise?.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center mb-3 gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                          {setIndex + 1}
                        </div>
                        
                        <div className="flex-grow grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleEditSet(setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => handleEditSet(setIndex, 'weight', parseInt(e.target.value) || 0)}
                              className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        {editExercise.sets.length > 1 && (
                          <div
                            onClick={() => handleRemoveSet(setIndex)}
                            className="flex-shrink-0 p-1 text-red-600 rounded hover:bg-red-50"
                            aria-label="Remove set"
                          >
                            <Trash2 size={16} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-3">
                    <div
                      onClick={handleCancel}
                      className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md flex items-center gap-1 hover:bg-gray-300"
                    >
                      <X size={16} /> Cancel
                    </div>
                    <div
                      onClick={handleSave}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center gap-1 hover:bg-blue-700"
                    >
                      <Save size={16} /> Save
                    </div>
                  </div>
                </div>
              ) : (
                // Exercise Display
                <div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <div 
                          onClick={() => toggleExpand(index)}
                          className="mr-2 focus:outline-none text-gray-500 hover:text-gray-700"
                        >
                          {expandedExercise === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {exercise.sets.length} sets • Total volume: {calculateTotalVolume(exercise)} kg
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <div
                        onClick={() => handleEdit(index)}
                        className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50"
                        aria-label="Edit exercise"
                      >
                        <Edit2 size={18} />
                      </div>
                      <div
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-red-600 rounded-md hover:bg-red-50"
                        aria-label="Delete exercise"
                      >
                        <Trash2 size={18} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedExercise === index && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Set Details</h4>
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center">
                            <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium mr-3">
                              {setIndex + 1}
                            </span>
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-gray-700">{set.reps} reps</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="font-medium text-gray-700">{set.weight} kg</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-500">Volume: {set.reps * set.weight} kg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
        )))
        :
        (<></>)
        }
      </div>

    </div>
  );
};

export default PushDayTracker;