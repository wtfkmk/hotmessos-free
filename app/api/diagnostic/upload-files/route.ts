import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // Verify bearer token and get user identity from it
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    // Look up the diagnostic record by user_id (not email)
    const { data: diagnosticData, error: diagnosticError } = await supabaseAdmin
      .from('paid_diagnostics')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (diagnosticError || !diagnosticData) {
      console.error('Error finding diagnostic record:', diagnosticError);
      return NextResponse.json(
        { error: 'Diagnostic record not found' },
        { status: 404 }
      );
    }

    const diagnosticId = diagnosticData.id;
    // Use user_id as the storage path prefix (stable, not PII in path)
    const storagePrefix = user.id;

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
      const websiteFileName = `${storagePrefix}/website-${Date.now()}-${websiteFile.name}`;
      const { error: websiteError } = await supabaseAdmin.storage
        .from('diagnostic-uploads')
        .upload(websiteFileName, websiteFile, {
          contentType: websiteFile.type,
          upsert: false
        });

      if (websiteError) {
        console.error('Website file upload error:', websiteError);
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage
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
      const sampleFileName = `${storagePrefix}/content-sample-${Date.now()}-${sampleIndex}-${contentSample.name}`;
      const { error: sampleError } = await supabaseAdmin.storage
        .from('diagnostic-uploads')
        .upload(sampleFileName, contentSample, {
          contentType: contentSample.type,
          upsert: false
        });

      if (sampleError) {
        console.error(`Content sample ${sampleIndex} upload error:`, sampleError);
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage
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
      const { error: insertError } = await supabaseAdmin
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

export const maxDuration = 60;
