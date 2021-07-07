import React, { useState } from "react";
import CourseCreateForm from "../../../components/forms/CourseCreateForm";
import InstructorRoute from "../../../components/routes/InstructorRoute";
import Resizer from "react-image-file-resizer";
import axios from "axios";
import { toast } from "react-toastify";

const CourseCreate = () => {
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "9.99",
    uploading: false,
    paid: true,
    category: "",
    loading: false
  });

  const [preview, setPreview] = useState("");
  const [uploadButtonText, setUploadButtonText] = useState("Upload Image");
  const [image, setImage] = useState("");

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImage = e => {
    let file = e.target.files[0];
    setPreview(window.URL.createObjectURL(file));
    setUploadButtonText(file.name);
    setValues({ ...values, loading: true });

    //resize
    Resizer.imageFileResizer(file, 720, 500, "JPEG", 100, 0, async uri => {
      try {
        let { data } = await axios.post("/api/course/upload-image", {
          image: uri
        });
        console.log("IMAGE UPlOADED", data);

        //set image in the state
        setValues({ ...values, loading: false });
        toast("Upload image successfully!");
      } catch (err) {
        console.log(err);
        setValues({ ...values, loading: false });
        new TransformStream("Image upload failed. Try later.");
      }
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">Create Course</h1>
      <div className="pt-3 pb-3">
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleImage={handleImage}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
        />
      </div>
      <pre>{JSON.stringify(values, null, 4)}</pre>
    </InstructorRoute>
  );
};

export default CourseCreate;
