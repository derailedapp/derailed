use axum::{
    Extension, Json,
    extract::{Multipart, State},
};
use ulid::Ulid;

use minio::s3::types::S3Api;

use zune_core::options::DecoderOptions;
use zune_image::codecs::ImageFormat;
use zune_image::image::Image;
use zune_image::traits::OperationsTrait;
use zune_imageprocs::crop::Crop;

use caesium::parameters::CSParameters;

pub async fn route(
    State(state): State<crate::State>,
    Extension(account_id): Extension<String>,

    mut multipart: Multipart,
) -> Result<Json<models::users::UserActor>, crate::Error> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| crate::Error::FieldIncorrect)?
    {
        match field.name().ok_or(crate::Error::FieldIncorrect)? {
            "avatar" => {
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|_| crate::Error::FieldIncorrect)?
                    .to_vec();

                let mut image = Image::read(bytes, DecoderOptions::default())?;

                let (w, h) = image.dimensions();
                let start_x = (w / 2) - 200;
                let start_y = (h / 2) - 200;

                Crop::new(400, 400, start_x, start_y).execute(&mut image)?;
                let image = image.write_to_vec(ImageFormat::JPEG)?;
                let mut parameters = CSParameters::new();
                parameters.jpeg.quality = 60;

                let image = caesium::compress_in_memory(image, &parameters).unwrap();

                let id = Ulid::new().to_string();
                state
                    .s3_client
                    .put_object_content("avatars", &id, image)
                    .send()
                    .await?;

                let actor = sqlx::query!("SELECT avatar_id FROM actors WHERE id = $1", account_id)
                    .fetch_one(&state.pg)
                    .await?;

                if let Some(avatar_id) = actor.avatar_id {
                    state
                        .s3_client
                        .delete_object("avatars", avatar_id)
                        .send()
                        .await?;
                }

                sqlx::query!(
                    "UPDATE actors SET avatar_id = $1 WHERE id = $2;",
                    id,
                    account_id
                )
                .execute(&state.pg)
                .await?;
            }
            "banner" => {
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|_| crate::Error::FieldIncorrect)?
                    .to_vec();

                let mut image = Image::read(bytes, DecoderOptions::default())?;

                let (w, h) = image.dimensions();
                let start_x = (w / 2) - 490;
                let start_y = (h / 2) - 200;

                Crop::new(980, 400, start_x, start_y).execute(&mut image)?;
                let image = image.write_to_vec(ImageFormat::JPEG)?;

                let mut parameters = CSParameters::new();
                parameters.webp.quality = 60;

                let image = caesium::compress_in_memory(image, &parameters).unwrap();

                let id = Ulid::new().to_string();
                state
                    .s3_client
                    .put_object_content("banners", &id, image)
                    .send()
                    .await?;

                let actor = sqlx::query!("SELECT banner_id FROM actors WHERE id = $1", account_id)
                    .fetch_one(&state.pg)
                    .await?;

                if let Some(banner_id) = actor.banner_id {
                    state
                        .s3_client
                        .delete_object("banners", banner_id)
                        .send()
                        .await?;
                }

                sqlx::query!(
                    "UPDATE actors SET banner_id = $1 WHERE id = $2;",
                    id,
                    account_id
                )
                .execute(&state.pg)
                .await?;
            }
            _ => {
                return Err(crate::Error::FieldIncorrect);
            }
        }
        continue;
    }

    let actor = sqlx::query_as!(
        models::users::UserActor,
        "SELECT * FROM actors WHERE id = $1",
        account_id
    )
    .fetch_one(&state.pg)
    .await?;

    Ok(Json(actor))
}
