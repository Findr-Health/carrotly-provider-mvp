import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviderData } from '../hooks/useProviderData';
import { Button } from '../components/common';
import { 
  MapPin, Phone, Mail, Globe, Star, Calendar, Camera, 
  Heart, Clock, DollarSign, Award, Languages, ArrowLeft
} from 'lucide-react';

export const ProfilePreview: React.FC = () => {
  const navigate = useNavigate();
  const { provider } = useProviderData();
  const [viewMode, setViewMode] = useState<'patient' | 'edit'>('patient');

  if (!provider || !provider.practiceName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profile data found</p>
          <Button variant="primary" onClick={() => navigate('/onboarding')}>
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  // Get services from provider
  const services = provider.services || [];

  // Get provider types
  const selectedTypes = provider.providerTypes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Toggle */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile Preview</h1>
                <p className="text-sm text-gray-600">How patients see your profile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('patient')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'patient'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Patient View
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Edit Mode
                </button>
              </div>
              
              <Button
                variant="primary"
                onClick={() => navigate('/edit-profile')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-500" />
          
          <div className="p-6 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Profile Photo */}
              {provider.photos && provider.photos.length > 0 ? (
                <img
                  src={provider.photos[0].url || provider.photos[0]}
                  alt={provider.practiceName}
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 md:mt-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.practiceName}</h1>
                
                {/* Provider Types */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTypes.map((type: string) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                
                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold text-gray-900">4.8</span>
                    <span className="ml-1">(127 reviews)</span>
                  </div>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Accepting new patients
                  </span>
                </div>
              </div>
              
              {/* CTA Button */}
              {viewMode === 'patient' && (
                <Button variant="primary" size="lg" className="mt-4 md:mt-12 whitespace-nowrap">
                  Book Appointment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        {provider.description && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">About Us</h2>
            <p className="text-gray-700 whitespace-pre-line">{provider.description}</p>
          </div>
        )}

        {/* Contact & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Location Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-teal-600" />
              Location
            </h2>
            <div className="text-gray-700 space-y-1">
              <p>{provider.address?.street}</p>
              {provider.address?.suite && <p>{provider.address.suite}</p>}
              <p>
                {provider.address?.city}, {provider.address?.state} {provider.address?.zip}
              </p>
            </div>
            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-3 flex items-center">
              Get Directions &rarr;
            </button>
          </div>
          
          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-teal-600" />
              Contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span>{provider.contactInfo?.phone || provider.phone || 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{provider.contactInfo?.email || provider.email || 'Not set'}</span>
              </div>
              {(provider.contactInfo?.website || provider.website) && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-3 text-gray-400" />
                  
                    href={provider.contactInfo?.website || provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700"
                  >
                    Visit Website &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-teal-600" />
              Hours
            </h2>
            {provider.calendar?.businessHours ? (
              <div className="space-y-2 text-sm">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                  const hours = provider.calendar?.businessHours?.[day];
                  const formatTime = (time: string) => {
                    const [h, m] = time.split(':').map(Number);
                    const period = h >= 12 ? 'PM' : 'AM';
                    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                  };
                  return (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span className={hours?.enabled ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {hours?.enabled ? `${formatTime(hours.start)} - ${formatTime(hours.end)}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Hours not set</p>
            )}
          </div>
        </div>

        {/* Team Members */}
        {provider.teamMembers && provider.teamMembers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-teal-600" />
              Our Team ({provider.teamMembers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.teamMembers.map((member: any) => (
                <div key={member.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-600 font-bold text-lg">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-teal-600">{member.title}</p>
                    {member.bio && <p className="text-sm text-gray-600 mt-1">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-teal-600" />
            Services Offered ({services.length})
          </h2>
          
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service: any) => (
                <div 
                  key={service.id || service._id || service.name} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {service.price}
                    </span>
                  </div>
                  {viewMode === 'patient' && (
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-3">
                      Book this service &rarr;
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No services added yet</p>
          )}
        </div>

        {/* Photos Gallery */}
        {provider.photos && provider.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-teal-600" />
              Photos ({provider.photos.length})
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {provider.photos.map((photo: any, idx: number) => (
                <img
                  key={idx}
                  src={photo.url || photo}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        {provider.credentials && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Credentials & Insurance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {provider.credentials.licenseNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">License</p>
                  <p className="font-medium text-gray-900">
                    {provider.credentials.licenseNumber} ({provider.credentials.licenseState})
                  </p>
                </div>
              )}
              
              {provider.credentials.npiNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">NPI Number</p>
                  <p className="font-medium text-gray-900">{provider.credentials.npiNumber}</p>
                </div>
              )}
              
              {provider.credentials.yearsExperience && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Experience
                  </p>
                  <p className="font-medium text-gray-900">{provider.credentials.yearsExperience} years</p>
                </div>
              )}
              
              {provider.credentials.education && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Education</p>
                  <p className="font-medium text-gray-900">{provider.credentials.education}</p>
                </div>
              )}
              
              {provider.credentials.insuranceAccepted && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Insurance Accepted</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.credentials.insuranceAccepted.split('\n').filter(Boolean).map((insurance: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                      >
                        {insurance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
