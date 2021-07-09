import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";
import { toast } from "react-toastify";
import CourseCreateForm from "../../../../components/forms/CourseCreateForm";
import InstructorRoute from "../../../../components/routes/InstructorRoute";
import { List, Avatar } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Item } = List;

const CourseEdit = () => {
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "9.99",
    uploading: false,
    paid: true,
    category: "",
    loading: false,
    lessons: []
  });

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!values?.paid) {
      setValues({ ...values, price: 0 });
    } else {
      setValues({ ...values, price: "9.99" });
    }
  }, [values?.paid]);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    const { data } = await axios.get(`/api/course/${slug}`);
    data && setValues(data);
    data?.image && setImage(data.image);
  };

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
        setImage(data);

        //set image in the state
        setValues({ ...values, loading: false });
        toast("Upload image successfully!");
      } catch (err) {
        console.log(err);
        setValues({ ...values, loading: false });
        toast("Image upload failed. Try later.");
      }
    });
  };

  const handleImageRemove = async e => {
    try {
      setValues({ ...values, loading: true });
      console.log("REMOVE IMAGE");
      const res = await axios.post("/api/course/remove-image", { image });
      setImage({});
      setPreview("");
      setUploadButtonText("Upload Image");
      setValues({ ...values, loading: false });
    } catch (err) {
      console.log(err);
      setValues({ ...values, loading: false });
      toast("Image upload failed. Try later.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // console.log(values);
    try {
      const { data } = await axios.put(`/api/course/${slug}`, {
        ...values,
        image
      });
      toast("Course updated!");
      //   router.push("/instructor");
    } catch (err) {
      console.log(err);
      toast(err.response.data);
    }
  };

  const handleDrag = (e, index) => {
    // console.log("on drag", index);
    e.dataTransfer.setData("itemIndex", index);
  };

  const handleDrop = async (e, index) => {
    // console.log("on drop", index);

    const movingItemIndex = e.dataTransfer.getData("itemIndex");
    const targetItemIndex = index;

    let allLessons = values.lessons;

    let movingItem = allLessons[movingItemIndex]; //clicked//dragged item to re-order
    allLessons.splice(movingItemIndex, 1); // remove 1 item from the given index
    allLessons.splice(targetItemIndex, 0, movingItem); //push item after target item index

    setValues({ ...values, lessons: [...allLessons] });
    //save the new lessons order in db

    const { data } = await axios.put(`/api/course/${slug}`, {
      ...values,
      image
    });

    console.log("LESSONS REARRANGED RES => ", data);
    toast("Lessons rearranged succesfully");
  };

  const handleDelete = async index => {
    let answer = window.confirm("Are you sure you want to delete?");
    if (!answer) return;
    let allLessons = values.lessons;
    const removed = allLessons.splice(index, 1);
    console.log("removed :>> ", removed);
    setValues({ ...values, lessons: allLessons });
    // send rq to server
    const { data } = await axios.put(`/api/course/${slug}/${removed[0]._id}`);
    console.log("LESSSON DELETE => ", data);
    if (data.ok) {
      toast("Delete lesson successfully!");
    }
  };

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">Update Course</h1>
      {/* <pre>{JSON.stringify(values, null, 4)}</pre> */}
      <div className="pt-3 pb-3">
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleImage={handleImage}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
          handleImageRemove={handleImageRemove}
          editPage={true}
        />
      </div>
      {/* <pre>{JSON.stringify(values, null, 4)}</pre>
      <hr />
      <pre>{JSON.stringify(image, null, 4)}</pre> */}
      <hr />

      <div className="row pb-5">
        <div className="col lesson-list">
          <div className="h4">{values?.lessons?.length} Lessons</div>
          <List
            onDragOver={e => e.preventDefault()}
            itemLayout="horizontal"
            dataSource={values?.lessons}
            renderItem={(item, index) => (
              <Item
                draggable
                onDragStart={e => handleDrag(e, index)}
                onDrop={e => handleDrop(e, index)}
              >
                <Item.Meta
                  avatar={<Avatar>{index + 1}</Avatar>}
                  title={item.title}
                ></Item.Meta>

                <DeleteOutlined
                  onClick={() => handleDelete(index)}
                  className="text-danger float-end pointer"
                />
              </Item>
            )}
          ></List>
        </div>
      </div>
    </InstructorRoute>
  );
};

export default CourseEdit;
