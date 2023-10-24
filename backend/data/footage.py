from moviepy.editor import VideoFileClip
import matplotlib.pyplot as plt

# Get the dimensions of a frame from the video
frame_height, frame_width, _ = frame.shape

# Calculate the cropping dimensions for the top-right quadrant
crop_top = 0
crop_bottom = frame_height // 2
crop_left = frame_width // 2
crop_right = frame_width

# Crop the video
cropped_clip = clip.crop(y1=crop_top, y2=crop_bottom, x1=crop_left, x2=crop_right)

# Save the cropped video
cropped_video_path = "/Users/minhtri/Desktop/Court/footage.mp4"
cropped_clip.write_videofile(cropped_video_path, codec="libx264", fps=clip.fps)

# Display a frame from the cropped video for verification
cropped_frame = cropped_clip.get_frame(frame_time)

# Show the frame
plt.imshow(cropped_frame)
plt.title("Cropped Video Frame (Top-Right Quadrant)")
plt.axis("off")
plt.show()

cropped_video_path
