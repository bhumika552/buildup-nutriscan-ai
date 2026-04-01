import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# image size
img_size = (224, 224)
batch_size = 32

# load dataset
train_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    "../dataset",   # path to dataset
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical'
)

# build CNN model
model = tf.keras.models.Sequential([
    tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),

    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(train_data.num_classes, activation='softmax')
])

# compile
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# train
model.fit(train_data, epochs=5)

# save model
model.save("model.h5")

print("Model trained and saved as model.h5 ✅")