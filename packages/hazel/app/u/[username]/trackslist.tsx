"use client";

import { useState } from "react";
import PreviewTrack from "../../previewtrack";

export default function TracksList(props: {
  tracksPosted: {
    id: number;
    author_id: string;
    content: string;
    referenced_track_id: string | null;
    retrack: boolean;
  }[];
  trackRefs: Map<
    string,
    {
      id: number;
      author_id: string;
      content: string;
      referenced_track_id: string | null;
      retrack: boolean;
    }
  >;
  authors: Map<
    string,
    {
      id: number;
      username: string;
      display_name: string | null;
      avatar: string | null;
      banner: string | null;
      bio: string | null;
    }
  >;
}) {
  const { tracksPosted, trackRefs, authors } = props;

  const [userTracks, setTracks] = useState(tracksPosted);

  return (
    <ol className="bg-not-as-black flex flex-col rounded-lg gap-6 p-5">
      {userTracks.map((track) => {
        return (
          <PreviewTrack
            track={track}
            author={authors.get(track.author_id)!}
            trackRef={trackRefs.get(track.referenced_track_id || "")}
          />
        );
      })}
    </ol>
  );
}
