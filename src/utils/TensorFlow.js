import * as tf from '@tensorflow/tfjs';

const loadModel = async () => {
  const model = await tf.loadGraphModel('path_to_yolo_model/model.json');
  return model;
};
