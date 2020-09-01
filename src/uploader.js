import React from "react";
import axios from "./axios";

export default class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filename: "Choose a file",
        };
    }
    handleChange(e) {
        console.log("e.target.files[0].name: ", e.target.files[0].name);
        this.setState({
            [e.target.name]: e.target.files[0],
            filename: e.target.files[0].name,
        });
    }
    uploadImage(e) {
        e.preventDefault();
        var formData = new FormData();
        console.log("this.state.file: ", this.state.file);
        formData.append("file", this.state.file);
        this.file = null;
        axios
            .post("/upload", formData)
            .then(({ data }) => {
                if (data.success) {
                    // it worked
                    console.log(
                        "data.imageUrl after POST upload:",
                        data.imageUrl
                    );
                    this.props.setImageUrl(data.imageUrl);
                } else {
                    // failure!
                    this.setState({
                        error: true,
                    });
                }
            })
            .catch((err) => {
                console.log("err in uploadImage() in upload.js: ", err);
            });
    }
    render() {
        return (
            <div className="uploader-box">
                <div className="uploader">
                    <div
                        className="close-button"
                        onClick={() => this.props.closeUploader()}
                    >
                        X
                    </div>
                    <p>Want to change your profile picture?</p>
                    <div className="button upload-button">
                        <svg className="icon">
                            <use xlinkHref="#upload" />
                        </svg>
                        <input
                            id="file"
                            type="file"
                            onChange={(e) => this.handleChange(e)}
                            name="file"
                            accept="image/*"
                        />
                        <label
                            name="filename"
                            htmlFor="file"
                            value={this.state.filename}
                        >
                            {this.state.filename}
                        </label>
                    </div>
                    <button onClick={(e) => this.uploadImage(e)}>Upload</button>
                </div>
            </div>
        );
    }
}
