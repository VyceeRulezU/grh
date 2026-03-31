import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import InstructorCard from '../../../shared/ui/InstructorCard';
import Pagination from '../../../shared/ui/Pagination';
import ModernDropdown from '../../../shared/ui/ModernDropdown';
import StatusModal from '../../../shared/ui/StatusModal';
import { useModal } from '../../../shared/hooks/useModal';
import './InstructorsManager.css';

const InstructorsManager = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        summary: '',
        avatar_url: '',
        category: 'Governance'
    });

    const { modal, closeModal, showSuccess, showError, showConfirm } = useModal();

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('instructors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInstructors(data || []);
        } catch (err) {
            console.error('Error fetching instructors:', err);
            // showError('Error', 'Failed to load instructors. Make sure the table exists.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.title) {
            showError('Invalid Form', 'Name and Title are required.');
            return;
        }

        setLoading(true);
        try {
            if (editingInstructor) {
                const { error } = await supabase
                    .from('instructors')
                    .update(formData)
                    .eq('id', editingInstructor.id);
                if (error) throw error;
                showSuccess('Updated!', 'Instructor details updated successfully.');
            } else {
                const { error } = await supabase
                    .from('instructors')
                    .insert([formData]);
                if (error) throw error;
                showSuccess('Added!', 'New instructor added successfully.');
            }
            setIsAddModalOpen(false);
            setEditingInstructor(null);
            setFormData({ name: '', title: '', summary: '', avatar_url: '', category: 'Governance' });
            fetchInstructors();
        } catch (err) {
            showError('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        showConfirm('Delete Instructor', 'Are you sure you want to remove this instructor? This action cannot be undone.', async () => {
            try {
                const { error } = await supabase
                    .from('instructors')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                showSuccess('Deleted', 'Instructor removed successfully.');
                fetchInstructors();
            } catch (err) {
                showError('Error', err.message);
            }
        });
    };

    const filtered = instructors.filter(inst => 
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="instr-manager">
            <header className="instr-header">
                <div className="instr-header-left">
                    <h2>Instructors & Leadership</h2>
                    <p>Manage people appearing in the About and Learn sections.</p>
                </div>
                <button className="special-button" onClick={() => {
                    setEditingInstructor(null);
                    setFormData({ name: '', title: '', summary: '', avatar_url: '', category: 'Governance' });
                    setIsAddModalOpen(true);
                }}>
                    <span className="material-symbols-outlined">person_add</span>
                    Add Instructor
                </button>
            </header>

            <div className="instr-controls">
                <div className="instr-search">
                    <span className="material-symbols-outlined">search</span>
                    <input 
                        type="text" 
                        placeholder="Search by name or title..." 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="instr-stats">
                    Showing {paginated.length} of {filtered.length} members
                </div>
            </div>

            {loading && instructors.length === 0 ? (
                <div className="instr-loading">
                    <div className="spinner"></div>
                    <p>Loading instructors...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="instr-empty">
                    <span className="material-symbols-outlined">person_search</span>
                    <h3>No instructors found</h3>
                    <p>Try a different search term or add a new member.</p>
                </div>
            ) : (
                <>
                    <div className="instr-grid">
                        {paginated.map(inst => (
                            <div key={inst.id} className="instr-card-container">
                                <InstructorCard 
                                    {...inst} 
                                    className="instr-card-hoverable"
                                    onClick={() => {
                                        setEditingInstructor(inst);
                                        setFormData({
                                            name: inst.name,
                                            title: inst.title,
                                            summary: inst.summary || '',
                                            avatar_url: inst.avatar_url || '',
                                            category: inst.category || 'Governance'
                                        });
                                        setIsAddModalOpen(true);
                                    }}
                                />
                                <button 
                                    className="instr-delete-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(inst.id);
                                    }}
                                    title="Delete Instructor"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="instr-pagination-box">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            pageSizeOptions={[10, 15, 20]}
                        />
                    </div>
                </>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal animate-up">
                        <header className="adm-modal-header">
                            <h3>{editingInstructor ? 'Edit Member' : 'Add New Member'}</h3>
                            <button className="adm-close-btn" onClick={() => setIsAddModalOpen(false)}>
                                <i className="ri-close-line"></i>
                            </button>
                        </header>
                        <div className="adm-modal-body">
                            <div className="adm-form-group">
                                <label>Full Name*</label>
                                <input 
                                    placeholder="e.g. Dr. Amaka Okonkwo" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="adm-form-row">
                                <div className="adm-form-group">
                                    <label>Role / Title*</label>
                                    <input 
                                        placeholder="e.g. Governance Specialist" 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label>Category</label>
                                    <ModernDropdown 
                                        options={['Governance', 'Finance', 'Leadership', 'Democracy', 'Integrity', 'Digital']}
                                        value={formData.category}
                                        onChange={v => setFormData({...formData, category: v})}
                                    />
                                </div>
                            </div>
                            <div className="adm-form-group">
                                <label>Avatar URL</label>
                                <input 
                                    placeholder="https://images.unsplash.com/..." 
                                    value={formData.avatar_url}
                                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                                />
                            </div>
                            <div className="adm-form-group">
                                <label>Brief Summary (Expertise / Background)</label>
                                <textarea 
                                    rows="4" 
                                    placeholder="A short bio that will show in the detail modal..."
                                    value={formData.summary}
                                    onChange={e => setFormData({...formData, summary: e.target.value})}
                                />
                            </div>
                        </div>
                        <footer className="adm-modal-footer">
                            <button className="btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            <button className="special-button" onClick={handleSave}>
                                {editingInstructor ? 'Save Changes' : 'Add Instructor'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            <StatusModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                onCancel={closeModal}
            />
        </div>
    );
};

export default InstructorsManager;
