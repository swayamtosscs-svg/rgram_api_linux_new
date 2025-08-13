# Script to download videos from the provided links

$videosDir = "public\videos\religious\hinduism"
$thumbnailsDir = "public\images\religious\hinduism"

# Create directories if they don't exist
if (!(Test-Path $videosDir)) {
    New-Item -ItemType Directory -Path $videosDir -Force
}

# Video URLs
$videoUrls = @(
    "https://dhaneshwaritosscs-netizen.github.io/vedios/",
    "https://dhaneshwaritosscs-netizen.github.io/vedio2/",
    "https://dhaneshwaritosscs-netizen.github.io/vedio3/"
)

# Download videos
for ($i = 0; $i -lt $videoUrls.Count; $i++) {
    $url = $videoUrls[$i]
    $videoFileName = "hindu_video_$($i+1).mp4"
    $videoPath = Join-Path $videosDir $videoFileName
    
    Write-Host "Downloading video from $url to $videoPath"
    
    try {
        # Get the HTML content
        $html = Invoke-WebRequest -Uri $url -UseBasicParsing
        
        # Extract the video source URL
        $videoSrc = $html.Content -match '<video[^>]*>\s*<source\s+src="([^"]+)"' | Out-Null
        $videoSrc = $Matches[1]
        
        if ($videoSrc) {
            # If the video source is relative, make it absolute
            if ($videoSrc -notmatch '^https?://') {
                $baseUrl = $url -replace '/[^/]*$', '/'
                $videoSrc = $baseUrl + $videoSrc
            }
            
            # Download the video
            Invoke-WebRequest -Uri $videoSrc -OutFile $videoPath
            Write-Host "Downloaded video to $videoPath"
            
            # Create a thumbnail from the first frame (this is a placeholder, actual implementation would require ffmpeg)
            # For now, we'll just copy an existing image as the thumbnail
            $thumbnailFiles = Get-ChildItem $thumbnailsDir -Filter "*.jpg"
            if ($thumbnailFiles.Count -gt 0) {
                $thumbnailPath = Join-Path $thumbnailsDir "video_thumbnail_$($i+1).jpg"
                Copy-Item -Path $thumbnailFiles[0].FullName -Destination $thumbnailPath
                Write-Host "Created thumbnail at $thumbnailPath"
            }
        } else {
            Write-Host "Could not find video source in the HTML content"
        }
    } catch {
        Write-Host "Error downloading video from $url: $($_.Exception.Message)"
    }
}

Write-Host "Video download process completed"