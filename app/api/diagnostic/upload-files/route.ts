import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the diagnostic_id for this user
    const { data: diagnosticData, error: diagnosticError } = await supabase
      .from('paid_diagnostics')
      .select('id')
      .eq('email', email)
      .single();

    if (diagnosticError || !diagnosticData) {
      console.error('Error finding diagnostic record:', diagnosticError);
      return NextResponse.json(
        { error: 'Diagnostic record not found' },
        { status: 404 }
      );
    }

    const diagnosticId = diagnosticData.id;

    const uploadedFiles: Array<{
      fileName: string;
      fileType: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }> = [];

    // Process website file
    const websiteFile = formData.get('websiteFile') as File | null;
    if (websiteFile) {
      const websiteFileName = `${email}/website-${Date.now()}-${websiteFile.name}`;
      const { data: websiteData, error: websiteError } = await supabase.storage
        .from('diagnostic-uploads')
        .upload(websiteFileName, websiteFile, {
          contentType: websiteFile.type,
          upsert: false
        });

      if (websiteError) {
        console.error('Website file upload error:', websiteError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('diagnostic-uploads')
          .getPublicUrl(websiteFileName);

        uploadedFiles.push({
          fileName: websiteFile.name,
          fileType: 'website',
          fileUrl: publicUrlData.publicUrl,
          fileSize: websiteFile.size,
          mimeType: websiteFile.type
        });
      }
    }

    // Process content sample files
    let sampleIndex = 0;
    let contentSample = formData.get(`contentSample${sampleIndex}`) as File | null;
    
    while (contentSample && sampleIndex < 5) {
      const sampleFileName = `${email}/content-sample-${Date.now()}-${sampleIndex}-${contentSample.name}`;
      const { data: sampleData, error: sampleError } = await supabase.storage
        .from('diagnostic-uploads')
        .upload(sampleFileName, contentSample, {
          contentType: contentSample.type,
          upsert: false
        });

      if (sampleError) {
        console.error(`Content sample ${sampleIndex} upload error:`, sampleError);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('diagnostic-uploads')
          .getPublicUrl(sampleFileName);

        uploadedFiles.push({
          fileName: contentSample.name,
          fileType: 'content-sample',
          fileUrl: publicUrlData.publicUrl,
          fileSize: contentSample.size,
          mimeType: contentSample.type
        });
      }

      sampleIndex++;
      contentSample = formData.get(`contentSample${sampleIndex}`) as File | null;
    }

    // Save file metadata to diagnostic_uploads table
    if (uploadedFiles.length > 0) {
      const { error: insertError } = await supabase
        .from('diagnostic_uploads')
        .insert(
          uploadedFiles.map(file => ({
            diagnostic_id: diagnosticId,
            file_type: file.fileType,
            file_url: file.fileUrl,
            original_filename: file.fileName,
            file_size: file.fileSize,
            mime_type: file.mimeType,
            created_at: new Date().toISOString()
          }))
        );

      if (insertError) {
        console.error('Error saving file metadata:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

// Increase body size limit for file uploads
export const maxDuration = 60; // optional: max execution time in seconds
// Body size limit is handled differently in App Router - remove the config export